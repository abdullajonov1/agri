# VH & Index Charts — Data Source Spec (Agro V6.3.3)

As of: 2026-11-06

## Purpose & scope

This spec defines which service attributes feed two charts in the Space Agro Monitoring widget v6.3.3 (`Agro_widgetV5`). Both charts read the `agri_vegetation_indices` table. The VH chart also reads hectares from `Agri_table_data`.

| Chart | UI panel | Shows | Main code |
| --- | --- | --- | --- |
| Index Indicators ("Index Ko'rsatkichlari") | GraffPanel | Time series of 6 vegetation indices | `gis/vegetation/veg-series.ts` |
| VH bar (Vegetation Health) | Localization → BarPanel | Hectares and field count per VH class | `gis/vegetation/status/status-latest-window.ts` |

## Data sources

Both services are defined in `shared/agri-service-urls.ts` and can be overridden in widget config (`vegetationIndicesUrl`, `tableDataUrl`). Both require a portal token.

| Service | URL | Used by |
| --- | --- | --- |
| `agri_vegetation_indices` | `https://sgm.uzspace.uz/server/rest/services/Agriculture/agri_vegetation_indices/FeatureServer/1` | Index chart, VH chart |
| `Agri_table_data` | `https://sgm.uzspace.uz/server/rest/services/Agriculture/Agri_table_data/FeatureServer/2` | VH chart (hectares) |

Join key between the two tables: `uniqueid`. Braces are stripped and matching is case-insensitive.

## Index Indicators chart

The chart plots the polygon-weighted mean of each index per `raster_date`, with an optional min/max band. Source table: `agri_vegetation_indices`.

**Value attributes**

| Index | Mean field | Band fields | Legend colour |
| --- | --- | --- | --- |
| NDVI | `ndvi` | `ndvi_min`, `ndvi_max` | #00d084 |
| SAVI | `savi` | `savi_min`, `savi_max` | #7aa5ff |
| RVI | `rvi` | `rvi_min`, `rvi_max` | #ffb347 |
| CI | `ci` | `ci_min`, `ci_max` | #c78bff |
| EVI | `evi` | none | #ff4d8d |
| NDWI | `ndwi` | `ndwi_min`, `ndwi_max` | #2ec4f1 |

**Query (regional mode)**

- Group by: `raster_date`, ordered ascending.
- Statistics: `AVG(<field>)` returned as `avg_<field>`, plus `COUNT(objectid)` returned as `polygon_count`.
- When several crops are selected, one query runs per `crop_id`. Rows are merged by date, with means weighted by `polygon_count`.

**Filter attributes**

| Attribute | Meaning | When applied |
| --- | --- | --- |
| `region` | Viloyat code | Viloyat selected |
| `district` | Tuman code | Tuman selected |
| `crop_id` | Crop | Crop(s) selected |
| `ndvi_status` | VH class | VH class selected |
| `raster_date` | Date window | Always; the query is skipped without a window |

**Modes**

1. Republic (no viloyat): AVG of the selected indices only. The default is `ndvi` alone; other indices load on toggle.
2. Viloyat or tuman: all 16 fields in one query, so legend toggles need no refetch.
3. Single polygon selected: `uniqueid = '<id>'`, `outFields = *`, ordered by `raster_date`.

## VH bar chart

Each bar is the sum of `Agri_table_data.maydon` (ha) over fields whose newest `ndvi_status` falls in that class. Hectares match the area indicator because both sum the same column.

**Step 1: newest status per field (`agri_vegetation_indices`)**

| Attribute | Role |
| --- | --- |
| `uniqueid` | Field identifier; group key |
| `ndvi_status` | VH class; group key |
| `crop_id` | Group key; selects the crop's VH window |
| `raster_date` | `MAX` = newest reading; also defines the window |
| `px_all` | `MAX`; fallback area = `px_all × 0.0009` ha |
| `objectid` | `COUNT` as `row_count` |
| `region`, `district` | Scope filter |

The window is the newest 10 days per region × crop, capped by a locked date if one is set. A field with no reading in that window falls back to its last reading earlier in the season. The newest reading wins.

**Step 2: hectares (`Agri_table_data`)**

| Attribute | Role |
| --- | --- |
| `maydon` | Bar value in ha (fallbacks: `area_ha`, `area`) |
| `uniqueid` | Join to step 1 |
| `crop_id` | Prefer the row with the same crop as the VH reading |
| `yil` | `LIKE '<year>%'` |
| `region`, `district` | Scope filter |

If the table query fails, the bar uses the `px_all` estimate.

**Status mapping** (`filter/localization/vh-constants.ts`)

| `ndvi_status` value | Bar category | Colour |
| --- | --- | --- |
| `juda_yaxshi` | 1-Juda yaxshi | #16a34a |
| `yaxshi` | 2-Yaxshi | #4ade80 |
| `orta` | 3-O'rta | #f97316 |
| `past` | 4-Past | #ef4444 |

## Data requirements & acceptance

If any field below is missing or renamed, the charts show empty or wrong values. The widget does not raise an error for this.

**Mandatory fields**

- `agri_vegetation_indices`: `objectid`, `uniqueid`, `region`, `district`, `crop_id`, `raster_date` (date type), `ndvi_status`, `px_all`, `ndvi`, `savi`, `rvi`, `ci`, `evi`, `ndwi`, and the `_min` / `_max` fields for every index except EVI.
- `Agri_table_data`: `objectid`, `uniqueid`, `region`, `district`, `crop_id`, `yil`, `maydon`.

**Service capabilities**

- Statistics queries with `groupByFieldsForStatistics` (AVG, MAX, COUNT).
- `ndvi_status` values exactly `juda_yaxshi`, `yaxshi`, `orta`, `past`, in lowercase.
- `region` and `district` use the same codes in both tables.

**Acceptance checks**

- [ ] For one viloyat and year, the VH bar total (ha) equals the area indicator's `SUM(maydon)` over the same fields.
- [ ] Index chart dates match the distinct `raster_date` values in the selected window.
- [ ] Selecting a VH class filters the Index chart by `ndvi_status`.
