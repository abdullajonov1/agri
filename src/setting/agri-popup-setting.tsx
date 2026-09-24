import {
  DataSource,
  DataSourceManager,
  IMUseDataSource,
  Immutable,
  React,
  ReactDOM,
} from "jimu-core";
import { type AllWidgetSettingProps } from "jimu-for-builder";
import { Option, Select, Switch, TextInput, MultiSelect } from "jimu-ui";
import { ColorPicker } from "jimu-ui/basic/color-picker";
import { type AgriPopupConfig, type IMConfig } from "../config";
import { getQueryableLayer } from "../gis/feature-layer-data";

/** jimu-core re-exports seamless-immutable as a namespace; cast for callable use. */
const Imm = Immutable as unknown as <T>(val: T) => any;

type FieldInfo = {
  name: string;
  alias: string;
  type: string;
};

interface State {
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
> {
  dsMgr = DataSourceManager.getInstance();
  private fieldsExtractToken = 0;
  private ownedDataSourceIds: string[] = [];
  private lastUseDataSourceKey = "";
  private popupFieldDragFrom: number | null = null;
  private popupFieldMenuRef = React.createRef<HTMLDivElement>();
  private popupFieldButtonRef = React.createRef<HTMLButtonElement>();
  private popupFieldListRef = React.createRef<HTMLUListElement>();
  private popupMenuFrame: {
    top: number;
    left: number;
    width: number;
    maxHeight: number;
  } | null = null;

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
    this.initializeDataSources();
    document.addEventListener("mousedown", this.onPopupFieldMenuOutside);
  }

  componentDidUpdate(
    prev: Readonly<AllWidgetSettingProps<IMConfig>>,
    prevState: State,
  ): void {
    const previousKey = this.getUseDataSourceKey(prev.useDataSources);
    const currentKey = this.getUseDataSourceKey(this.props.useDataSources);
    if (previousKey !== currentKey) {
      this.initializeDataSources();
    }
    if (prev.config !== this.props.config) {
      const agri = this.getAgriConfig();
      const nextFields = [...(agri.fieldsToShow || [])];
      const nextOrder = [...(agri.fieldOrder || [])];
      this.setState((s) => ({
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
    if (this.state.popupFieldMenuOpen && !prevState.popupFieldMenuOpen) {
      this.placePopupFieldMenu();
      window.addEventListener("scroll", this.placePopupFieldMenu, true);
      window.addEventListener("resize", this.placePopupFieldMenu);
    } else if (!this.state.popupFieldMenuOpen && prevState.popupFieldMenuOpen) {
      this.detachPopupFieldMenuListeners();
    }
  }

  componentWillUnmount(): void {
    document.removeEventListener("mousedown", this.onPopupFieldMenuOutside);
    this.detachPopupFieldMenuListeners();
    this.cleanupDataSources();
  }

  private detachPopupFieldMenuListeners = () => {
    window.removeEventListener("scroll", this.placePopupFieldMenu, true);
    window.removeEventListener("resize", this.placePopupFieldMenu);
  };

  private placePopupFieldMenu = () => {
    const button = this.popupFieldButtonRef.current;
    if (!button) return;
    const rect = button.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom - 8;
    const spaceAbove = rect.top - 8;
    const openUp = spaceBelow < 160 && spaceAbove > spaceBelow;
    const maxHeight = Math.max(120, Math.min(280, openUp ? spaceAbove : spaceBelow));
    const frame = {
      top: openUp ? Math.max(8, rect.top - maxHeight - 2) : rect.bottom + 2,
      left: rect.left,
      width: rect.width,
      maxHeight,
    };
    const prev = this.popupMenuFrame;
    if (
      prev &&
      prev.top === frame.top &&
      prev.left === frame.left &&
      prev.width === frame.width &&
      prev.maxHeight === frame.maxHeight
    ) {
      return;
    }
    this.popupMenuFrame = frame;
    if (this.state.popupFieldMenuOpen) this.forceUpdate();
  };

  private onPopupFieldMenuOutside = (event: MouseEvent) => {
    if (!this.state.popupFieldMenuOpen) return;
    const target = event.target as Node;
    const root = this.popupFieldMenuRef.current;
    const list = this.popupFieldListRef.current;
    if (root?.contains(target) || list?.contains(target)) return;
    this.setState({ popupFieldMenuOpen: false });
  };

  private toPlainAgri(value: unknown): AgriPopupConfig {
    if (!value) return {};
    if (typeof (value as any).asMutable === "function") {
      return (value as any).asMutable({ deep: true });
    }
    return { ...(value as AgriPopupConfig) };
  }

  private getAgriConfig(): AgriPopupConfig {
    return this.toPlainAgri(this.props.config?.agriPopup);
  }

  private ensureDashboardConfig(): IMConfig {
    return (
      this.props.config ??
      Imm({
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
    ) as IMConfig;
  }

  private updateAgriConfig = (patch: Partial<AgriPopupConfig>) => {
    const cfg = this.ensureDashboardConfig();
    const current = this.getAgriConfig();
    const merged: AgriPopupConfig = { ...current, ...patch };
    if (patch.settings) {
      merged.settings = { ...(current.settings || {}), ...patch.settings };
    }
    this.props.onSettingChange({
      id: this.props.id,
      config: (cfg as any).set("agriPopup", Imm(merged)),
    });
  };

  private commitPopupFields = (fieldsToShow: string[], fieldOrder: string[]) => {
    this.setState({ fieldsToShowLocal: fieldsToShow, fieldOrder });
    this.updateAgriConfig({ fieldsToShow, fieldOrder });
  };

  private orderedPopupFieldNames = (): string[] => {
    const known = this.state.allFields.map((field) => field.name);
    return this.mergeFieldOrder(
      known.map((name) => ({ name, alias: name, type: "" })),
      this.state.fieldOrder,
    );
  };

  private togglePopupField = (name: string) => {
    const selected = new Set(this.state.fieldsToShowLocal);
    if (selected.has(name)) selected.delete(name);
    else selected.add(name);
    const order = this.orderedPopupFieldNames();
    this.commitPopupFields(
      order.filter((item) => selected.has(item)),
      order,
    );
  };

  private reorderPopupOptions = (from: number, to: number) => {
    const order = this.orderedPopupFieldNames();
    if (
      from === to ||
      from < 0 ||
      to < 0 ||
      from >= order.length ||
      to >= order.length
    ) {
      return;
    }
    const [moved] = order.splice(from, 1);
    order.splice(to, 0, moved);
    const selected = new Set(this.state.fieldsToShowLocal);
    this.commitPopupFields(
      order.filter((item) => selected.has(item)),
      order,
    );
  };

  private renderPopupFieldSelect = (fieldsToShow: string[]) => {
    const order = this.orderedPopupFieldNames();
    const byName = new Map(this.state.allFields.map((field) => [field.name, field]));
    const selected = new Set(fieldsToShow);
    const summary = fieldsToShow.length
      ? `${fieldsToShow.length} tanlangan: ${fieldsToShow
          .map((name) => {
            const field = byName.get(name);
            return field ? this.formatFieldLabel(field) : name;
          })
          .join(", ")}`
      : "Maydonlarni tanlang...";

    const frame = this.popupMenuFrame;
    const menu =
      this.state.popupFieldMenuOpen && frame
        ? ReactDOM.createPortal(
          <ul
            ref={this.popupFieldListRef}
            style={{
              position: "fixed",
              zIndex: 100000,
              left: frame.left,
              top: frame.top,
              width: frame.width,
              margin: 0,
              padding: 4,
              listStyle: "none",
              maxHeight: frame.maxHeight,
              overflowY: "auto",
              background: "#2b2b2b",
              color: "#f3f3f3",
              border: "1px solid #4a4a4a",
              borderRadius: 4,
              boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
            }}
          >
            {order.map((name, index) => {
              const field = byName.get(name);
              const label = field ? this.formatFieldLabel(field) : name;
              return (
                <li
                  key={name}
                  draggable
                  onDragStart={(event) => {
                    this.popupFieldDragFrom = index;
                    event.dataTransfer.effectAllowed = "move";
                    event.dataTransfer.setData("text/plain", name);
                  }}
                  onDragEnd={() => {
                    this.popupFieldDragFrom = null;
                  }}
                  onDragOver={(event) => {
                    event.preventDefault();
                    event.dataTransfer.dropEffect = "move";
                  }}
                  onDrop={(event) => {
                    event.preventDefault();
                    const from = this.popupFieldDragFrom;
                    this.popupFieldDragFrom = null;
                    if (from == null) return;
                    this.reorderPopupOptions(from, index);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "6px 8px",
                    borderRadius: 3,
                    fontSize: 13,
                    cursor: "grab",
                  }}
                >
                  <span
                    aria-hidden="true"
                    style={{
                      color: "#b7b7b7",
                      letterSpacing: -1,
                      userSelect: "none",
                    }}
                  >
                    ⋮⋮
                  </span>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      flex: 1,
                      margin: 0,
                      cursor: "pointer",
                      color: "#f3f3f3",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selected.has(name)}
                      onMouseDown={(event) => event.stopPropagation()}
                      onChange={() => this.togglePopupField(name)}
                    />
                    <span>{label}</span>
                  </label>
                </li>
              );
            })}
          </ul>,
          document.body,
        )
        : null;

    return (
      <div ref={this.popupFieldMenuRef}>
        <button
          ref={this.popupFieldButtonRef}
          type="button"
          onClick={() =>
            this.setState((s) => ({ popupFieldMenuOpen: !s.popupFieldMenuOpen }))
          }
          style={{
            width: "100%",
            textAlign: "left",
            padding: "6px 28px 6px 10px",
            border: "1px solid #6a6a6a",
            borderRadius: 4,
            background: "#fff",
            color: "#1a1a1a",
            fontSize: 13,
            cursor: "pointer",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {summary}
        </button>
        {menu}
      </div>
    );
  };

  private onChartFieldsMultiSelect = (
    _evt: React.MouseEvent,
    _value: string | number,
    selectedValues: Array<string | number>,
  ) => {
    const next = selectedValues.map((v) => String(v));
    this.updateAgriConfig({ chartFields: next });
  };

  private onAttachmentsToggle = (e: any) => {
    const val = !!e?.target?.checked;
    const agri = this.getAgriConfig();
    this.updateAgriConfig({
      settings: {
        ...(agri.settings || {}),
        showAttachments: val,
      },
    });
  };

  private initializeDataSources = async () => {
    if (this.props.useDataSources?.length) {
      const all = this.props.useDataSources.asMutable() as IMUseDataSource[];
      const webMapId = String(
        (this.props.config as any)?.webMapDataSourceId || "",
      );
      const candidates = all.filter(
        (source) => String(source?.dataSourceId || "") !== webMapId,
      );
      const key = this.getUseDataSourceKey(candidates);
      if (key === this.lastUseDataSourceKey && this.state.dss?.length) return;
      this.lastUseDataSourceKey = key;
      // Region/year polygon layers share the same schema. One representative
      // feature source is enough for popup field configuration; walking all
      // 20-30 sources blocks Builder while every service/schema is loaded.
      await this.createDataSources(candidates.slice(0, 1));
    } else {
      this.lastUseDataSourceKey = "";
      this.releaseOwnedDataSources();
      this.setState({ dss: null, allFields: [] });
    }
  };

  private getUseDataSourceKey(value: unknown): string {
    const list = Array.isArray(value)
      ? value
      : typeof (value as any)?.asMutable === "function"
        ? (value as any).asMutable()
        : [];
    return (list as IMUseDataSource[])
      .map((source) => String(source?.dataSourceId || ""))
      .filter(Boolean)
      .sort()
      .join("|");
  }

  private releaseOwnedDataSources = () => {
    for (const id of this.ownedDataSourceIds) {
      try {
        this.dsMgr.destroyDataSource(id);
      } catch {
        /* ignore */
      }
    }
    this.ownedDataSourceIds = [];
  };

  private cleanupDataSources = () => {
    this.releaseOwnedDataSources();
  };

  private createDataSources = async (useList: IMUseDataSource[]) => {
    this.releaseOwnedDataSources();
    const dsArr: DataSource[] = [];
    for (const uds of useList) {
      const dsId = String(uds?.dataSourceId || "");
      if (!dsId) continue;

      let ds = this.dsMgr.getDataSource(dsId) as DataSource | null;
      let owned = false;
      if (!ds) {
        try {
          ds = await this.dsMgr.createDataSourceByUseDataSource(uds);
          owned = !!ds;
        } catch {
          /* ignore */
        }
      }

      if (ds) {
        dsArr.push(ds);
        if (owned) this.ownedDataSourceIds.push(dsId);
      }
    }
    this.setState({ dss: dsArr }, () => {
      void this.extractFieldsFromDs();
    });
  };

  private fieldsFromSchemaObject = (
    fieldsObj: Record<string, any>,
  ): FieldInfo[] => {
    return Object.keys(fieldsObj || {}).map((key) => {
      const f = fieldsObj[key];
      return {
        name: f?.name || f?.jimuName || key,
        alias: f?.alias || f?.displayName || f?.name || key,
        type: f?.type || f?.esriType || "unknown",
      };
    });
  };

  private fieldsFromLayer = (layer: any): FieldInfo[] => {
    const raw = Array.isArray(layer?.fields) ? layer.fields : [];
    return raw
      .map((f: any) => {
        const name = String(f?.name || "").trim();
        if (!name) return null;
        return {
          name,
          alias: String(f?.alias || f?.name || name),
          type: String(f?.type || "unknown"),
        };
      })
      .filter(Boolean) as FieldInfo[];
  };

  private resolveLayerFromDataSource = async (ds: any): Promise<any | null> => {
    if (!ds) return null;

    const candidates = [
      ds?.layer,
      typeof ds?.getLayer === "function" ? ds.getLayer() : null,
      typeof ds?.getJimuLayer === "function" ? ds.getJimuLayer() : null,
      typeof ds?.getMainLayer === "function" ? ds.getMainLayer() : null,
    ].filter(Boolean);

    for (const candidate of candidates) {
      const layer = getQueryableLayer(candidate) || candidate;
      if (!layer) continue;
      try {
        if (typeof layer.load === "function" && !layer.loaded) {
          await layer.load();
        }
      } catch {
        /* ignore */
      }
      if (Array.isArray(layer.fields) && layer.fields.length > 0) {
        return layer;
      }
    }

    const children =
      typeof ds?.getChildDataSources === "function"
        ? ds.getChildDataSources()
        : [];
    if (Array.isArray(children)) {
      for (const child of children) {
        const childLayer = await this.resolveLayerFromDataSource(child);
        if (childLayer?.fields?.length) return childLayer;
      }
    }

    return null;
  };

  private extractFieldsFromDs = async () => {
    const token = ++this.fieldsExtractToken;
    const dss = this.state.dss;
    if (!dss || dss.length === 0) {
      this.setState({ allFields: [] });
      return;
    }

    const merged = new Map<string, FieldInfo>();
    const addFields = (fields: FieldInfo[]) => {
      for (const field of fields) {
        if (!field?.name) continue;
        const prev = merged.get(field.name);
        if (!prev) {
          merged.set(field.name, field);
          continue;
        }
        const prevDefault = !prev.alias || prev.alias === prev.name;
        const nextBetter = !!field.alias && field.alias !== field.name;
        if (prevDefault && nextBetter) {
          merged.set(field.name, field);
        }
      }
    };

    for (const ds of dss) {
      const anyDs = ds as any;

      try {
        if (typeof anyDs.fetchSchema === "function") {
          const schema = await anyDs.fetchSchema();
          if (token !== this.fieldsExtractToken) return;
          addFields(this.fieldsFromSchemaObject(schema?.fields || {}));
        }
      } catch {
        /* ignore */
      }

      const cached = anyDs.getSchema?.();
      if (cached?.fields) {
        addFields(this.fieldsFromSchemaObject(cached.fields));
      }

      try {
        const layer = await this.resolveLayerFromDataSource(anyDs);
        if (token !== this.fieldsExtractToken) return;
        addFields(this.fieldsFromLayer(layer));
      } catch {
        /* ignore */
      }
    }

    if (token !== this.fieldsExtractToken) return;
    const allFields = Array.from(merged.values());
    this.setState((s) => ({
      allFields,
      fieldOrder: this.mergeFieldOrder(
        allFields,
        s.fieldOrder.length ? s.fieldOrder : this.getAgriConfig().fieldOrder || []
      ),
    }));
  };

  private mergeFieldOrder(fields: FieldInfo[], saved: string[]): string[] {
    const names = fields.map((field) => field.name);
    const known = new Set(names);
    const base = (saved || []).filter((name) => known.has(name));
    const rest = names.filter((name) => !base.includes(name));
    return [...base, ...rest];
  }

  private onChartEnabledToggle = (e: any) => {
    this.updateAgriConfig({ chartEnabled: !!e?.target?.checked });
  };

  private onChartTypeChange = (e: any) => {
    this.updateAgriConfig({ chartType: e?.target?.value as "bar" | "line" });
  };

  private onChartTitleChange = (val: string) => {
    this.updateAgriConfig({ chartTitle: val });
  };

  private onChartColorChange = (color: string) => {
    this.updateAgriConfig({ chartColor: color });
  };

  private onZoomToggle = (e: any) => {
    const val = !!e?.target?.checked;
    const agri = this.getAgriConfig();
    this.setState({ zoomToSelection: val });
    this.updateAgriConfig({
      settings: {
        ...(agri.settings || {}),
        zoomToSelection: val,
      },
    });
  };

  private onPopupToggle = (e: any) => {
    const val = !!e?.target?.checked;
    const agri = this.getAgriConfig();
    this.setState({ showMapPopup: val });
    this.updateAgriConfig({
      settings: { ...(agri.settings || {}), showMapPopup: val },
    });
  };

  private formatFieldLabel = (f: FieldInfo): string => {
    const alias = String(f.alias || "").trim();
    const name = String(f.name || "").trim();
    if (alias && alias.toLowerCase() !== name.toLowerCase()) {
      return `${alias} (${name})`;
    }
    return alias || name;
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
    const { allFields } = this.state;
    const items = Imm(
      allFields.map((f) => ({
        value: f.name,
        label: this.formatFieldLabel(f),
      })),
    );
    return (
      <MultiSelect
        key={options?.selectKey}
        size="sm"
        fluid
        appendToBody
        zIndex={options?.menuZIndex ?? 2000}
        placeholder={placeholder}
        items={items as any}
        values={Imm(selectedItems) as any}
        onClickItem={onItemClick}
        menuProps={{
          style: { zIndex: options?.menuZIndex ?? 2000 },
        }}
        displayByValues={(values: Array<string | number>) => {
          if (!values?.length) return placeholder;
          const labels = values.map((v: string | number) => {
            const f = allFields.find((ff) => ff.name === String(v));
            return f ? this.formatFieldLabel(f) : String(v);
          });
          return `${values.length} tanlangan: ${labels.join(", ")}`;
        }}
      />
    );
  };

  render() {
    const { useDataSources } = this.props;
    const agri = this.getAgriConfig();
    const dsConnected = !!(useDataSources && useDataSources.length > 0);
    const fieldsToShow = this.state.fieldsToShowLocal;
    const chartEnabled = !!agri.chartEnabled;
    const chartType = agri.chartType || "bar";
    const chartTitle = agri.chartTitle || "";
    const chartFields = agri.chartFields || [];
    const chartColor = agri.chartColor || "#00a8e8";

    return (
      <div
        style={{
          marginTop: 20,
          paddingTop: 16,
          borderTop: "1px solid rgba(0,0,0,0.12)",
        }}
      >
        <h4 style={{ margin: "0 0 6px" }}>Polygon Popup</h4>
        <p style={{ margin: "0 0 14px", fontSize: 12, color: "#5b6b7a" }}>
          Xarita va Feature layer sozlamalari yuqoridagi umumiy bo&apos;limdan
          foydalanadi. Poligon bosilganda chiqadigan popup uchun quyidagi
          sozlamalarni tanlang.
        </p>

        {dsConnected && (
          <section style={{ marginBottom: 20, position: "relative", zIndex: 5 }}>
            <h4 style={{ margin: "0 0 8px" }}>Fields to Display</h4>
            <p style={{ margin: "0 0 8px", color: "#666", fontSize: 12 }}>
              Polygon bosilganda ko&apos;rsatiladigan atributlarni tanlang.
            </p>
            {this.renderPopupFieldSelect(fieldsToShow)}
          </section>
        )}

        {dsConnected && (
          <section
            style={{
              marginBottom: 20,
              padding: 12,
              border: "1px solid rgba(0,0,0,0.1)",
              borderRadius: 8,
              background: "rgba(0,0,0,0.02)",
              position: "relative",
              zIndex: 1,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: chartEnabled ? 14 : 0,
              }}
            >
              <h4 style={{ margin: 0 }}>📊 Chart</h4>
              <Switch
                checked={chartEnabled}
                onChange={this.onChartEnabledToggle}
              />
            </div>

            {chartEnabled && (
              <div
                style={{ display: "flex", flexDirection: "column", gap: 14 }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: 4,
                      fontSize: 12,
                      color: "#5b6b7a",
                    }}
                  >
                    Chart turi
                  </label>
                  <Select
                    size="sm"
                    value={chartType}
                    onChange={this.onChartTypeChange}
                    style={{ width: "100%" }}
                  >
                    <Option value="bar">📊 Bar Chart</Option>
                    <Option value="line">📈 Line Chart</Option>
                  </Select>
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: 4,
                      fontSize: 12,
                      color: "#5b6b7a",
                    }}
                  >
                    Chart sarlavhasi
                  </label>
                  <TextInput
                    size="sm"
                    placeholder="Chart nomini yozing..."
                    value={chartTitle}
                    onChange={(e) => this.onChartTitleChange(e.target.value)}
                    style={{ width: "100%" }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: 4,
                      fontSize: 12,
                      color: "#5b6b7a",
                    }}
                  >
                    Chart maydonlari
                  </label>
                  {this.renderFieldsMultiSelect(
                    chartFields,
                    this.onChartFieldsMultiSelect,
                    "Chart uchun maydonlarni tanlang...",
                  )}
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: 4,
                      fontSize: 12,
                      color: "#5b6b7a",
                    }}
                  >
                    Chart rangi
                  </label>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <ColorPicker
                      color={chartColor}
                      onChange={this.onChartColorChange}
                    />
                    <span style={{ fontSize: 12, color: "#5b6b7a" }}>
                      {chartColor}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </section>
        )}

        <section style={{ marginBottom: 10 }}>
          <h4 style={{ margin: "0 0 8px" }}>Behavior</h4>
          <div style={{ display: "grid", gap: 10 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Switch
                checked={this.state.zoomToSelection}
                onChange={this.onZoomToggle}
              />
              <span>Zoom to selection</span>
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Switch
                checked={this.state.showMapPopup}
                onChange={this.onPopupToggle}
              />
              <span>Also open map popup</span>
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Switch
                checked={agri.settings?.showAttachments !== false}
                onChange={this.onAttachmentsToggle}
              />
              <span>Include attachments (Photos &amp; Files)</span>
            </label>
          </div>
        </section>
      </div>
    );
  }
}
