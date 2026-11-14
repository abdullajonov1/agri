/** Geography row used to fill both republic and district report sheets. */
export type ReportGeoRow = {
  /** Display name written into the Excel "Hudud nomi" / "Tuman" column. */
  name: string;
  /** Normalized key for joining layer aggregates. */
  key: string;
};

export type ReportScope = {
  yil: string;
  /** Empty = republic-wide (Viloyat template). Non-empty = district template. */
  viloyat: string;
  /** Non-empty (with viloyat) = farmer-level Fermer template. */
  tuman?: string;
};

/** One Fermer report line: a farmer's area and average yield for one crop. */
export type FarmerRow = {
  viloyat: string;
  tuman: string;
  name: string;
  inn: string;
  turi: string;
  /** AVG(yld) from Agri_table_data for this farmer × crop; 0 when none. */
  hosildorlik: number;
  maydon: number;
};

export type CropAreaRow = {
  key: string;
  /** Monitoring / total crop area (ga). */
  area: number;
  /** Irrigated (asosiy) when land-type split is available. */
  asosiy: number;
  /** Rainfed (lalmi) when land-type split is available. */
  lalmi: number;
  /** Crop Agro plan area (ga) from agri_crop; 0 when missing. */
  reja: number;
  /** Ozuqa area (ga) shown in the g'alla "ehtimoliy" column. */
  ehtimoliy: number;
};

/** Plan-only aggregate from agri_crop (joined onto CropAreaRow.reja). */
export type PlanAreaRow = {
  key: string;
  area: number;
};

export type ReserveAreaRow = {
  key: string;
  kontur: number;
  umumiy: number;
  /** Crop areas keyed by canonical crop key (bugdoy, paxta, …) plus vegetativ. */
  byCrop: Record<string, number>;
};

export type UnusedAreaRow = {
  key: string;
  kontur: number;
  maydon: number;
};

export type ReportDataBundle = {
  scope: ReportScope;
  /** Rows in display order (viloyats or tumans). */
  geos: ReportGeoRow[];
  paxta: CropAreaRow[];
  galla: CropAreaRow[];
  reserve: ReserveAreaRow[];
  unused: UnusedAreaRow[];
};

export type ReportExportResult = {
  filename: string;
  blob: Blob;
};
