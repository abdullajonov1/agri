import {
  DataSource,
  DataSourceManager,
  IMUseDataSource,
  React,
} from "jimu-core";
import { type AllWidgetSettingProps } from "jimu-for-builder";
import { type AgriPopupConfig, type IMConfig } from "../config";
import type { FieldBearingLayer } from "./components/popup-data-sources";
import type { PopupMenuFrame, SchemaFieldLike } from "./components/popup-field-utils";

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
export default class AgriPopupSettingPanel extends React.PureComponent<
  AllWidgetSettingProps<IMConfig>,
  State
> {
  dsMgr = DataSourceManager.getInstance();
  private fieldsExtractToken = 0;
  private ownedDataSourceIds: string[] = [];
  private lastUseDataSourceKey = "";
  private popupFieldDragFrom: number | null = null;
  private popupFieldMenuRef = React.createRef<HTMLDivElement>();
  private popupFieldButtonRef = React.createRef<HTMLButtonElement>();
  private popupFieldListRef = React.createRef<HTMLUListElement>();
  private popupMenuFrame: PopupMenuFrame | null = null;

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
    return componentDidMount(this as unknown as PopupSettingHost);
  }

  componentDidUpdate(
    prev: Readonly<AllWidgetSettingProps<IMConfig>>,
    prevState: State,
  ): void {
    return componentDidUpdate(this as unknown as PopupSettingHost, prev, prevState);
  }

  componentWillUnmount(): void {
    return componentWillUnmount(this as unknown as PopupSettingHost);
  }

  private detachPopupFieldMenuListeners = () => {
    return detachPopupFieldMenuListeners(this as unknown as PopupSettingHost);
  };

  private placePopupFieldMenu = () => {
    return placePopupFieldMenu(this as unknown as PopupSettingHost);
  };

  private onPopupFieldMenuOutside = (event: MouseEvent) => {
    return onPopupFieldMenuOutside(this as unknown as PopupSettingHost, event);
  };

  private toPlainAgri(value: unknown): AgriPopupConfig {
    return toPlainAgri(this as unknown as PopupSettingHost, value);
  }

  private getAgriConfig(): AgriPopupConfig {
    return getAgriConfig(this as unknown as PopupSettingHost);
  }

  private ensureDashboardConfig(): IMConfig {
    return ensureDashboardConfig(this as unknown as PopupSettingHost);
  }

  private updateAgriConfig = (patch: Partial<AgriPopupConfig>) => {
    return updateAgriConfig(this as unknown as PopupSettingHost, patch);
  };

  private commitPopupFields = (fieldsToShow: string[], fieldOrder: string[]) => {
    return commitPopupFields(this as unknown as PopupSettingHost, fieldsToShow, fieldOrder);
  };

  private orderedPopupFieldNames = (): string[] => {
    return orderedPopupFieldNames(this as unknown as PopupSettingHost);
  };

  private togglePopupField = (name: string) => {
    return togglePopupField(this as unknown as PopupSettingHost, name);
  };

  private reorderPopupOptions = (from: number, to: number) => {
    return reorderPopupOptions(this as unknown as PopupSettingHost, from, to);
  };

  private renderPopupFieldSelect = (fieldsToShow: string[]) => {
    return renderPopupFieldSelect(this as unknown as PopupSettingHost, fieldsToShow);
  };

  private onChartFieldsMultiSelect = (
    _evt: React.MouseEvent,
    _value: string | number,
    selectedValues: Array<string | number>,
  ) => {
    return onChartFieldsMultiSelect(this as unknown as PopupSettingHost, _evt, _value, selectedValues);
  };

  private onAttachmentsToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    return onAttachmentsToggle(this as unknown as PopupSettingHost, e);
  };

  private initializeDataSources = async () => {
    return initializeDataSources(this as unknown as PopupSettingHost);
  };

  private getUseDataSourceKey(value: unknown): string {
    return getUseDataSourceKey(this as unknown as PopupSettingHost, value);
  }

  private releaseOwnedDataSources = () => {
    return releaseOwnedDataSources(this as unknown as PopupSettingHost);
  };

  private cleanupDataSources = () => {
    return cleanupDataSources(this as unknown as PopupSettingHost);
  };

  private createDataSources = async (useList: IMUseDataSource[]) => {
    return createDataSources(this as unknown as PopupSettingHost, useList);
  };

  private fieldsFromSchemaObject = (
    fieldsObj: Record<string, SchemaFieldLike | undefined>,
  ): FieldInfo[] => {
    return fieldsFromSchemaObject(this as unknown as PopupSettingHost, fieldsObj);
  };

  private fieldsFromLayer = (layer: unknown): FieldInfo[] => {
    return fieldsFromLayer(this as unknown as PopupSettingHost, layer);
  };

  private resolveLayerFromDataSource = async (ds: unknown): Promise<FieldBearingLayer | null> => {
    return resolveLayerFromDataSource(this as unknown as PopupSettingHost, ds);
  };

  private extractFieldsFromDs = async () => {
    return extractFieldsFromDs(this as unknown as PopupSettingHost);
  };

  private mergeFieldOrder(fields: FieldInfo[], saved: string[]): string[] {
    return mergeFieldOrder(this as unknown as PopupSettingHost, fields, saved);
  }

  private onChartEnabledToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    return onChartEnabledToggle(this as unknown as PopupSettingHost, e);
  };

  private onChartTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    return onChartTypeChange(this as unknown as PopupSettingHost, e);
  };

  private onChartTitleChange = (val: string) => {
    return onChartTitleChange(this as unknown as PopupSettingHost, val);
  };

  private onChartColorChange = (color: string) => {
    return onChartColorChange(this as unknown as PopupSettingHost, color);
  };

  private onZoomToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    return onZoomToggle(this as unknown as PopupSettingHost, e);
  };

  private onPopupToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    return onPopupToggle(this as unknown as PopupSettingHost, e);
  };

  private formatFieldLabel = (f: FieldInfo): string => {
    return formatFieldLabel(this as unknown as PopupSettingHost, f);
  };

  private renderFieldsMultiSelect = (
    selectedItems: string[],
    onItemClick: (
      evt: React.MouseEvent,
      value: string | number,
      selectedValues: Array<string | number>,
    ) => void,
    placeholder: string,
    options?: { menuZIndex?: number; selectKey?: string },
  ) => {
    return renderFieldsMultiSelect(this as unknown as PopupSettingHost, selectedItems, onItemClick, placeholder, options);
  };

  render() {
    return render(this as unknown as PopupSettingHost);
  }
}
