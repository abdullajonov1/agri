# agri — Space Agro Monitoring (Agro_widgetV5 / V6)

## Portal (Experience Builder)

Stable manifest URL (use this in Portal custom widgets):

https://abdullajonov1.github.io/agri/widgets/Agro_widgetV6/manifest.json

After each code change, republish the built package (`bash scripts/publish-agri.sh` from the ExB widget folder). Then in Portal: **Custom widgets → Agro_widgetV6 → Update**.

GitHub Pages updates automatically on push; Portal caches the old build until you click **Update**.

## Local development

Clone this repo into ExB:

`client/your-extensions/widgets/Agro_widgetV5/`

Then `npm start` in the ExB client.

Do **not** register the raw GitHub source URL as a custom widget — Portal needs `widgets/Agro_widgetV6` + `widgets/chunks`.

## Source layout (`src/`)

| Folder | What lives there |
|---|---|
| `runtime/` | Dashboard shell widget: layout, embedded map, lazy panel loading |
| `panels/` | One folder per dashboard panel (Graff, Pie, Region, Bar, Indicator*, Popup, DateIndex). Each has `runtime/widget.tsx` plus a `*-host.ts` interface the helpers take instead of the class |
| `filter/` | Localization panel (region / district / year / crop filters, map filtering) |
| `gis/` | ArcGIS query layer: feature-layer lookups, vegetation stats, admin boundaries, polygon API (`gis/polygon-api/`) |
| `data/`, `controller/`, `store/` | Query planning, WHERE builders, caches (`agri-persistent-cache.ts`), dashboard state |
| `shared/` | Cross-cutting helpers: `agri-http.ts` (the only place allowed to call `fetch`), access config, logout, immutable-value helpers (`agri-plain-object.ts`) |
| `setting/` | Builder settings UI (access rules, popup config) |

Large modules are split into folders; the original file path is kept as a barrel that re-exports the same names, so import paths do not change.

## Checks

Run from `client/`:

```bash
npx jest -c your-extensions/widgets/agri-main/jest.config.js           # unit tests
npx tsc --noEmit -p your-extensions/widgets/agri-main/tsconfig.jest.json # types (one jimu-core SDK error is expected)
npx eslint your-extensions/widgets/agri-main/src --ext .ts,.tsx         # widget lint rules (.eslintrc.js)
node your-extensions/widgets/agri-main/scripts/check-quality.mjs        # no any / empty catch / console, files <= 800 lines
node your-extensions/widgets/agri-main/scripts/check-network-timeouts.mjs  # every request has a timeout
node your-extensions/widgets/agri-main/scripts/smoke-sql-helpers.mjs    # SQL helper smoke test
```

The pre-commit hook in `scripts/git-hooks/pre-commit` runs the gate, the timeout check, ESLint and Jest. Enable it once per clone:

```bash
git config core.hooksPath scripts/git-hooks
```

### Rules the checks enforce

- No `any`; use ArcGIS `__esri.*` / jimu-core types, or `unknown` plus narrowing for external data.
- No empty `catch {}`; log through the module's debug logger or explain why ignoring is safe.
- Network calls go through `shared/agri-http.ts` (timeouts, size caps, typed errors); every `esriRequest` passes `timeout: AGRI_ESRI_REQUEST_TIMEOUT_MS`.
- Source files stay at or under 800 lines.
