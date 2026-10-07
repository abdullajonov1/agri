import type { PopupSettingHost } from "../popup-setting-host";
import type { AllWidgetSettingProps } from "jimu-for-builder";
import type { Config, IMConfig, AgriPopupConfig } from "../../config";
import type { State, FieldInfo } from "../agri-popup-setting";
import { React, Immutable } from "jimu-core";
import { hasAsMutable } from "../plain-value";
import {
  computePopupMenuFrame,
  formatFieldInfoLabel,
  isSameMenuFrame,
  moveListItem,
} from "./popup-field-utils";

export {
  initializeDataSources,
  getUseDataSourceKey,
  releaseOwnedDataSources,
  cleanupDataSources,
  createDataSources,
  fieldsFromSchemaObject,
  fieldsFromLayer,
  resolveLayerFromDataSource,
  extractFieldsFromDs,
  mergeFieldOrder,
} from "./popup-data-sources";
export {
  renderPopupFieldSelect,
  renderFieldsMultiSelect,
  render,
} from "./popup-setting-render";

/** Switch / checkbox change event as delivered by jimu-ui `Switch`. */
type CheckedChangeEvent = React.ChangeEvent<HTMLInputElement>;

export function componentDidMount(host: PopupSettingHost): void {
  host.initializeDataSources();
  document.addEventListener("mousedown", host.onPopupFieldMenuOutside);
}

export function componentDidUpdate(host: PopupSettingHost, prev: Readonly<AllWidgetSettingProps<IMConfig>>, prevState: State): void {
  const previousKey = host.getUseDataSourceKey(prev.useDataSources);
  const currentKey = host.getUseDataSourceKey(host.props.useDataSources);
  if (previousKey !== currentKey) {
    host.initializeDataSources();
  }
  if (prev.config !== host.props.config) {
    const agri = host.getAgriConfig();
    const nextFields = [...(agri.fieldsToShow || [])];
    const nextOrder = [...(agri.fieldOrder || [])];
    host.setState((s) => ({
      fieldsToShowLocal:
        JSON.stringify(s.fieldsToShowLocal) === JSON.stringify(nextFields)
          ? s.fieldsToShowLocal
          : nextFields,
      fieldOrder:
        !nextOrder.length ||
        JSON.stringify(s.fieldOrder) === JSON.stringify(nextOrder)
          ? s.fieldOrder
          : nextOrder,
      zoomToSelection: agri.settings?.zoomToSelection !== false,
      showMapPopup: !!agri.settings?.showMapPopup,
    }));
  }
  if (host.state.popupFieldMenuOpen && !prevState.popupFieldMenuOpen) {
    host.placePopupFieldMenu();
    window.addEventListener("scroll", host.placePopupFieldMenu, true);
    window.addEventListener("resize", host.placePopupFieldMenu);
  } else if (!host.state.popupFieldMenuOpen && prevState.popupFieldMenuOpen) {
    host.detachPopupFieldMenuListeners();
  }
}

export function componentWillUnmount(host: PopupSettingHost): void {
  document.removeEventListener("mousedown", host.onPopupFieldMenuOutside);
  host.detachPopupFieldMenuListeners();
  host.cleanupDataSources();
}

export const detachPopupFieldMenuListeners = (host: PopupSettingHost) => {
  window.removeEventListener("scroll", host.placePopupFieldMenu, true);
  window.removeEventListener("resize", host.placePopupFieldMenu);
};

export const placePopupFieldMenu = (host: PopupSettingHost) => {
  const button = host.popupFieldButtonRef.current;
  if (!button) return;
  const frame = computePopupMenuFrame(button.getBoundingClientRect(), window.innerHeight);
  if (isSameMenuFrame(host.popupMenuFrame, frame)) {
    return;
  }
  host.popupMenuFrame = frame;
  if (host.state.popupFieldMenuOpen) host.forceUpdate();
};

export const onPopupFieldMenuOutside = (host: PopupSettingHost, event: MouseEvent) => {
  if (!host.state.popupFieldMenuOpen) return;
  const target = event.target as Node;
  const root = host.popupFieldMenuRef.current;
  const list = host.popupFieldListRef.current;
  if (root?.contains(target) || list?.contains(target)) return;
  host.setState({ popupFieldMenuOpen: false });
};

export function toPlainAgri(_host: PopupSettingHost, value: unknown): AgriPopupConfig {
  if (!value) return {};
  if (hasAsMutable<AgriPopupConfig>(value)) {
    return value.asMutable({ deep: true });
  }
  return { ...(value as AgriPopupConfig) };
}

export function getAgriConfig(host: PopupSettingHost): AgriPopupConfig {
  return host.toPlainAgri(host.props.config?.agriPopup);
}

export function ensureDashboardConfig(host: PopupSettingHost): IMConfig {
  return (
    host.props.config ??
    Immutable.from<Config>({
      leftPanelWidthPercent: 26,
      bottomRowFraction: 0.42,
      agriPopup: {
        fieldsToShow: [],
        titleField: "",
        labels: {},
        settings: {
          zoomToSelection: true,
          showMapPopup: false,
          showAttachments: true,
        },
        chartEnabled: false,
        chartType: "bar",
        chartTitle: "",
        chartFields: [],
        chartColor: "#00a8e8",
      },
    })
  );
}

export const updateAgriConfig = (host: PopupSettingHost, patch: Partial<AgriPopupConfig>) => {
  const cfg = host.ensureDashboardConfig();
  const current = host.getAgriConfig();
  const merged: AgriPopupConfig = { ...current, ...patch };
  if (patch.settings) {
    merged.settings = { ...(current.settings || {}), ...patch.settings };
  }
  host.props.onSettingChange({
    id: host.props.id,
    config: cfg.set("agriPopup", Immutable.from(merged)),
  });
};

export const commitPopupFields = (host: PopupSettingHost, fieldsToShow: string[], fieldOrder: string[]) => {
  host.setState({ fieldsToShowLocal: fieldsToShow, fieldOrder });
  host.updateAgriConfig({ fieldsToShow, fieldOrder });
};

export const orderedPopupFieldNames = (host: PopupSettingHost): string[] => {
  const known = host.state.allFields.map((field) => field.name);
  return host.mergeFieldOrder(
    known.map((name) => ({ name, alias: name, type: "" })),
    host.state.fieldOrder,
  );
};

export const togglePopupField = (host: PopupSettingHost, name: string) => {
  const selected = new Set(host.state.fieldsToShowLocal);
  if (selected.has(name)) selected.delete(name);
  else selected.add(name);
  const order = host.orderedPopupFieldNames();
  host.commitPopupFields(
    order.filter((item) => selected.has(item)),
    order,
  );
};

export const reorderPopupOptions = (host: PopupSettingHost, from: number, to: number) => {
  const order = moveListItem(host.orderedPopupFieldNames(), from, to);
  if (!order) return;
  const selected = new Set(host.state.fieldsToShowLocal);
  host.commitPopupFields(
    order.filter((item) => selected.has(item)),
    order,
  );
};

export const onChartFieldsMultiSelect = (host: PopupSettingHost, _evt: React.MouseEvent, _value: string | number, selectedValues: Array<string | number>) => {
  const next = selectedValues.map((v) => String(v));
  host.updateAgriConfig({ chartFields: next });
};

export const onAttachmentsToggle = (host: PopupSettingHost, e: CheckedChangeEvent) => {
  const val = !!e?.target?.checked;
  const agri = host.getAgriConfig();
  host.updateAgriConfig({
    settings: {
      ...(agri.settings || {}),
      showAttachments: val,
    },
  });
};

export const onChartEnabledToggle = (host: PopupSettingHost, e: CheckedChangeEvent) => {
  host.updateAgriConfig({ chartEnabled: !!e?.target?.checked });
};

export const onChartTypeChange = (host: PopupSettingHost, e: React.ChangeEvent<HTMLSelectElement>) => {
  host.updateAgriConfig({ chartType: e?.target?.value as "bar" | "line" });
};

export const onChartTitleChange = (host: PopupSettingHost, val: string) => {
  host.updateAgriConfig({ chartTitle: val });
};

export const onChartColorChange = (host: PopupSettingHost, color: string) => {
  host.updateAgriConfig({ chartColor: color });
};

export const onZoomToggle = (host: PopupSettingHost, e: CheckedChangeEvent) => {
  const val = !!e?.target?.checked;
  const agri = host.getAgriConfig();
  host.setState({ zoomToSelection: val });
  host.updateAgriConfig({
    settings: {
      ...(agri.settings || {}),
      zoomToSelection: val,
    },
  });
};

export const onPopupToggle = (host: PopupSettingHost, e: CheckedChangeEvent) => {
  const val = !!e?.target?.checked;
  const agri = host.getAgriConfig();
  host.setState({ showMapPopup: val });
  host.updateAgriConfig({
    settings: { ...(agri.settings || {}), showMapPopup: val },
  });
};

export const formatFieldLabel = (_host: PopupSettingHost, f: FieldInfo): string =>
  formatFieldInfoLabel(f);
