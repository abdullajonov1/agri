import {
  type DataSource,
  DataSourceManager,
  type IMUseDataSource,
  React,
} from "jimu-core";
import { type AllWidgetSettingProps } from "jimu-for-builder";
import { type AgriPopupConfig, type IMConfig } from "../config";
import type { FieldBearingLayer } from "./components/popup-data-sources";
import type { PopupMenuFrame, SchemaFieldLike } from "./components/popup-field-utils";

import {
  componentDidMount,
  componentDidUpdate,
  componentWillUnmount,
  detachPopupFieldMenuListeners,
  placePopupFieldMenu,
  onPopupFieldMenuOutside,
  toPlainAgri,
  getAgriConfig,
  ensureDashboardConfig,
  updateAgriConfig,
  commitPopupFields,
  orderedPopupFieldNames,
  togglePopupField,
  reorderPopupOptions,
  renderPopupFieldSelect,
  onChartFieldsMultiSelect,
  onAttachmentsToggle,
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
  onChartEnabledToggle,
  onChartTypeChange,
  onChartTitleChange,
  onChartColorChange,
  onZoomToggle,
  onPopupToggle,
  formatFieldLabel,
  renderFieldsMultiSelect,
  render,
} from "./components/popup-setting-handlers";
import type { PopupSettingHost } from "./popup-setting-host";

export type FieldInfo = {
  name: string;
  alias: string;
  type: string;
};

export interface State {
  dss: DataSource[] | null;
  titleField: string;
  zoomToSelection: boolean;
  showMapPopup: boolean;
  allFields: FieldInfo[];
  fieldsToShowLocal: string[];
  fieldOrder: string[];
  popupFieldMenuOpen: boolean;
}
export default class AgriPopupSettingPanel extends React.PureComponent<
  AllWidgetSettingProps<IMConfig>,
  State
> implements PopupSettingHost {
  dsMgr = DataSourceManager.getInstance();
fieldsExtractToken = 0;
ownedDataSourceIds: string[] = [];
lastUseDataSourceKey = "";
popupFieldDragFrom: number | null = null;
popupFieldMenuRef = React.createRef<HTMLDivElement>();
popupFieldButtonRef = React.createRef<HTMLButtonElement>();
popupFieldListRef = React.createRef<HTMLUListElement>();
popupMenuFrame: PopupMenuFrame | null = null;

  constructor(props: AllWidgetSettingProps<IMConfig>) {
    super(props);
    const agri = this.getAgriConfig();

    this.state = {
      dss: null,
      titleField: agri.titleField || "",
      zoomToSelection: agri.settings?.zoomToSelection !== false,
      showMapPopup: !!agri.settings?.showMapPopup,
      allFields: [],
      fieldsToShowLocal: [...(agri.fieldsToShow || [])],
      fieldOrder: [...(agri.fieldOrder || [])],
      popupFieldMenuOpen: false,
    };
  }

  componentDidMount(): void {
    componentDidMount(this);
  }

  componentDidUpdate(
    prev: Readonly<AllWidgetSettingProps<IMConfig>>,
    prevState: State,
  ): void {
    componentDidUpdate(this, prev, prevState);
  }

  componentWillUnmount(): void {
    componentWillUnmount(this);
  }

detachPopupFieldMenuListeners = () => {
    detachPopupFieldMenuListeners(this);
  };

placePopupFieldMenu = () => {
    placePopupFieldMenu(this);
  };

onPopupFieldMenuOutside = (event: MouseEvent) => {
    onPopupFieldMenuOutside(this, event);
  };

toPlainAgri(value: unknown): AgriPopupConfig {
    return toPlainAgri(this, value);
  }

getAgriConfig(): AgriPopupConfig {
    return getAgriConfig(this);
  }

ensureDashboardConfig(): IMConfig {
    return ensureDashboardConfig(this);
  }

updateAgriConfig = (patch: Partial<AgriPopupConfig>) => {
    updateAgriConfig(this, patch);
  };

commitPopupFields = (fieldsToShow: string[], fieldOrder: string[]) => {
    commitPopupFields(this, fieldsToShow, fieldOrder);
  };

orderedPopupFieldNames = (): string[] => {
    return orderedPopupFieldNames(this);
  };

togglePopupField = (name: string) => {
    togglePopupField(this, name);
  };

reorderPopupOptions = (from: number, to: number) => {
    reorderPopupOptions(this, from, to);
  };

renderPopupFieldSelect = (fieldsToShow: string[]) => {
    return renderPopupFieldSelect(this, fieldsToShow);
  };

onChartFieldsMultiSelect = (
    _evt: React.MouseEvent,
    _value: string | number,
    selectedValues: Array<string | number>,
  ) => {
    onChartFieldsMultiSelect(this, _evt, _value, selectedValues);
  };

onAttachmentsToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    onAttachmentsToggle(this, e);
  };

initializeDataSources = async () => {
    return initializeDataSources(this);
  };

getUseDataSourceKey(value: unknown): string {
    return getUseDataSourceKey(this, value);
  }

releaseOwnedDataSources = () => {
    releaseOwnedDataSources(this);
  };

cleanupDataSources = () => {
    cleanupDataSources(this);
  };

createDataSources = async (useList: IMUseDataSource[]) => {
    return createDataSources(this, useList);
  };

fieldsFromSchemaObject = (
    fieldsObj: Record<string, SchemaFieldLike | undefined>,
  ): FieldInfo[] => {
    return fieldsFromSchemaObject(this, fieldsObj);
  };

fieldsFromLayer = (layer: unknown): FieldInfo[] => {
    return fieldsFromLayer(this, layer);
  };

resolveLayerFromDataSource = async (ds: unknown): Promise<FieldBearingLayer | null> => {
    return resolveLayerFromDataSource(this, ds);
  };

extractFieldsFromDs = async () => {
    return extractFieldsFromDs(this);
  };

mergeFieldOrder(fields: FieldInfo[], saved: string[]): string[] {
    return mergeFieldOrder(this, fields, saved);
  }

onChartEnabledToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChartEnabledToggle(this, e);
  };

onChartTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChartTypeChange(this, e);
  };

onChartTitleChange = (val: string) => {
    onChartTitleChange(this, val);
  };

onChartColorChange = (color: string) => {
    onChartColorChange(this, color);
  };

onZoomToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    onZoomToggle(this, e);
  };

onPopupToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    onPopupToggle(this, e);
  };

formatFieldLabel = (f: FieldInfo): string => {
    return formatFieldLabel(this, f);
  };

renderFieldsMultiSelect = (
    selectedItems: string[],
    onItemClick: (
      evt: React.MouseEvent,
      value: string | number,
      selectedValues: Array<string | number>,
    ) => void,
    placeholder: string,
    options?: { menuZIndex?: number; selectKey?: string },
  ) => {
    return renderFieldsMultiSelect(this, selectedItems, onItemClick, placeholder, options);
  };

  render() {
    return render(this);
  }
}
