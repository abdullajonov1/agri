/** @jsx jsx */
import {
  DataSourceComponent,
  jsx,
  type DataSource,
  type IMUseDataSource,
  type QueriableDataSource,
  type UseDataSource,
} from "jimu-core";
import { JimuMapViewComponent, type JimuMapView } from "jimu-arcgis";
import { toPlainArray } from "./agri-data-source-engine";

interface Props {
  /** Immutable or plain list of UseDataSource (see toPlainArray). */
  useDataSources?: unknown;
  /** Immutable or plain list of map widget ids. */
  useMapWidgetIds?: unknown;
  onDataSourceCreated?: (ds: QueriableDataSource) => void;
  onActiveViewChange?: (jimuMapView: JimuMapView) => void;
}

/** Hidden DataSource + Map connectors (same pattern as AgriLocalization).
 * Only connect the first useDataSource — mounting all ~30+ region FeatureServers
 * on every child remount floods Network with FeatureServer?f=json loads and
 * does not help map hit-testing (live MapView layers are used instead). */
export function AgriHiddenConnectors(props: Props): JSX.Element {
  const selectedUseDataSources = toPlainArray<UseDataSource>(props.useDataSources);
  const mapWidgetId = toPlainArray<string>(props.useMapWidgetIds)[0];
  const primaryDs = selectedUseDataSources[0];

  return (
    <div style={{ display: "none" }} aria-hidden="true">
      {primaryDs ? (
        <DataSourceComponent
          key={primaryDs?.dataSourceId}
          // Deep-mutable copy (toPlainArray); jimu only reads its fields.
          useDataSource={primaryDs as unknown as IMUseDataSource}
          onDataSourceCreated={
            props.onDataSourceCreated
              ? (ds: DataSource) => {
                  props.onDataSourceCreated?.(ds as QueriableDataSource);
                }
              : undefined
          }
        />
      ) : null}
      {mapWidgetId && (
        <JimuMapViewComponent
          useMapWidgetId={mapWidgetId}
          onActiveViewChange={props.onActiveViewChange}
        />
      )}
    </div>
  );
}
