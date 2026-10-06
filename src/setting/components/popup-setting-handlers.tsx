import type { PopupSettingHost } from "../popup-setting-host";
import type { AllWidgetSettingProps } from "jimu-for-builder";
import type { IMConfig, AgriPopupConfig } from "../../config";
import type { State, FieldInfo } from "../agri-popup-setting";
import { ReactDOM, React, IMUseDataSource, DataSource, Immutable } from "jimu-core";
import { getQueryableLayer } from "../../gis/feature-layer-data";
import { MultiSelect, Switch, Select, Option, TextInput } from "jimu-ui";
import { ColorPicker } from "jimu-ui/basic/color-picker";

/** jimu-core re-exports seamless-immutable as a namespace; cast for callable use. */
const Imm = Immutable as unknown as <T>(val: T) => any;

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
  const prev = host.popupMenuFrame;
  if (
    prev &&
    prev.top === frame.top &&
    prev.left === frame.left &&
    prev.width === frame.width &&
    prev.maxHeight === frame.maxHeight
  ) {
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

export function toPlainAgri(host: PopupSettingHost, value: unknown): AgriPopupConfig {
  if (!value) return {};
  if (typeof (value as any).asMutable === "function") {
    return (value as any).asMutable({ deep: true });
  }
  return { ...(value as AgriPopupConfig) };
}

export function getAgriConfig(host: PopupSettingHost): AgriPopupConfig {
  return host.toPlainAgri(host.props.config?.agriPopup);
}

export function ensureDashboardConfig(host: PopupSettingHost): IMConfig {
  return (
    host.props.config ??
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

export const updateAgriConfig = (host: PopupSettingHost, patch: Partial<AgriPopupConfig>) => {
  const cfg = host.ensureDashboardConfig();
  const current = host.getAgriConfig();
  const merged: AgriPopupConfig = { ...current, ...patch };
  if (patch.settings) {
    merged.settings = { ...(current.settings || {}), ...patch.settings };
  }
  host.props.onSettingChange({
    id: host.props.id,
    config: (cfg as any).set("agriPopup", Imm(merged)),
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
  const order = host.orderedPopupFieldNames();
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
  const selected = new Set(host.state.fieldsToShowLocal);
  host.commitPopupFields(
    order.filter((item) => selected.has(item)),
    order,
  );
};

export const renderPopupFieldSelect = (host: PopupSettingHost, fieldsToShow: string[]) => {
  const order = host.orderedPopupFieldNames();
  const byName = new Map(host.state.allFields.map((field) => [field.name, field]));
  const selected = new Set(fieldsToShow);
  const summary = fieldsToShow.length
    ? `${fieldsToShow.length} tanlangan: ${fieldsToShow
        .map((name) => {
          const field = byName.get(name);
          return field ? host.formatFieldLabel(field) : name;
        })
        .join(", ")}`
    : "Maydonlarni tanlang...";

  const frame = host.popupMenuFrame;
  const menu =
    host.state.popupFieldMenuOpen && frame
      ? ReactDOM.createPortal(
        <ul
          ref={host.popupFieldListRef}
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
            const label = field ? host.formatFieldLabel(field) : name;
            return (
              <li
                key={name}
                draggable
                onDragStart={(event) => {
                  host.popupFieldDragFrom = index;
                  event.dataTransfer.effectAllowed = "move";
                  event.dataTransfer.setData("text/plain", name);
                }}
                onDragEnd={() => {
                  host.popupFieldDragFrom = null;
                }}
                onDragOver={(event) => {
                  event.preventDefault();
                  event.dataTransfer.dropEffect = "move";
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  const from = host.popupFieldDragFrom;
                  host.popupFieldDragFrom = null;
                  if (from == null) return;
                  host.reorderPopupOptions(from, index);
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
                    onChange={() => host.togglePopupField(name)}
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
    <div ref={host.popupFieldMenuRef}>
      <button
        ref={host.popupFieldButtonRef}
        type="button"
        onClick={() =>
          host.setState((s) => ({ popupFieldMenuOpen: !s.popupFieldMenuOpen }))
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

export const onChartFieldsMultiSelect = (host: PopupSettingHost, _evt: React.MouseEvent, _value: string | number, selectedValues: Array<string | number>) => {
  const next = selectedValues.map((v) => String(v));
  host.updateAgriConfig({ chartFields: next });
};

export const onAttachmentsToggle = (host: PopupSettingHost, e: any) => {
  const val = !!e?.target?.checked;
  const agri = host.getAgriConfig();
  host.updateAgriConfig({
    settings: {
      ...(agri.settings || {}),
      showAttachments: val,
    },
  });
};

export const initializeDataSources = async (host: PopupSettingHost) => {
  if (host.props.useDataSources?.length) {
    const all = host.props.useDataSources.asMutable() as IMUseDataSource[];
    const webMapId = String(
      (host.props.config as any)?.webMapDataSourceId || "",
    );
    const candidates = all.filter(
      (source) => String(source?.dataSourceId || "") !== webMapId,
    );
    const key = host.getUseDataSourceKey(candidates);
    if (key === host.lastUseDataSourceKey && host.state.dss?.length) return;
    host.lastUseDataSourceKey = key;
    // Region/year polygon layers share the same schema. One representative
    // feature source is enough for popup field configuration; walking all
    // 20-30 sources blocks Builder while every service/schema is loaded.
    await host.createDataSources(candidates.slice(0, 1));
  } else {
    host.lastUseDataSourceKey = "";
    host.releaseOwnedDataSources();
    host.setState({ dss: null, allFields: [] });
  }
};

export function getUseDataSourceKey(host: PopupSettingHost, value: unknown): string {
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

export const releaseOwnedDataSources = (host: PopupSettingHost) => {
  for (const id of host.ownedDataSourceIds) {
    try {
      host.dsMgr.destroyDataSource(id);
    } catch {
      /* ignore */
    }
  }
  host.ownedDataSourceIds = [];
};

export const cleanupDataSources = (host: PopupSettingHost) => {
  host.releaseOwnedDataSources();
};

export const createDataSources = async (host: PopupSettingHost, useList: IMUseDataSource[]) => {
  host.releaseOwnedDataSources();
  const dsArr: DataSource[] = [];
  for (const uds of useList) {
    const dsId = String(uds?.dataSourceId || "");
    if (!dsId) continue;

    let ds = host.dsMgr.getDataSource(dsId) as DataSource | null;
    let owned = false;
    if (!ds) {
      try {
        ds = await host.dsMgr.createDataSourceByUseDataSource(uds);
        owned = !!ds;
      } catch {
        /* ignore */
      }
    }

    if (ds) {
      dsArr.push(ds);
      if (owned) host.ownedDataSourceIds.push(dsId);
    }
  }
  host.setState({ dss: dsArr }, () => {
    void host.extractFieldsFromDs();
  });
};

export const fieldsFromSchemaObject = (host: PopupSettingHost, fieldsObj: Record<string, any>): FieldInfo[] => {
  return Object.keys(fieldsObj || {}).map((key) => {
    const f = fieldsObj[key];
    return {
      name: f?.name || f?.jimuName || key,
      alias: f?.alias || f?.displayName || f?.name || key,
      type: f?.type || f?.esriType || "unknown",
    };
  });
};

export const fieldsFromLayer = (host: PopupSettingHost, layer: any): FieldInfo[] => {
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

export const resolveLayerFromDataSource = async (host: PopupSettingHost, ds: any): Promise<any | null> => {
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
      const childLayer = await host.resolveLayerFromDataSource(child);
      if (childLayer?.fields?.length) return childLayer;
    }
  }

  return null;
};

export const extractFieldsFromDs = async (host: PopupSettingHost) => {
  const token = ++host.fieldsExtractToken;
  const dss = host.state.dss;
  if (!dss || dss.length === 0) {
    host.setState({ allFields: [] });
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
        if (token !== host.fieldsExtractToken) return;
        addFields(host.fieldsFromSchemaObject(schema?.fields || {}));
      }
    } catch {
      /* ignore */
    }

    const cached = anyDs.getSchema?.();
    if (cached?.fields) {
      addFields(host.fieldsFromSchemaObject(cached.fields));
    }

    try {
      const layer = await host.resolveLayerFromDataSource(anyDs);
      if (token !== host.fieldsExtractToken) return;
      addFields(host.fieldsFromLayer(layer));
    } catch {
      /* ignore */
    }
  }

  if (token !== host.fieldsExtractToken) return;
  const allFields = Array.from(merged.values());
  host.setState((s) => ({
    allFields,
    fieldOrder: host.mergeFieldOrder(
      allFields,
      s.fieldOrder.length ? s.fieldOrder : host.getAgriConfig().fieldOrder || []
    ),
  }));
};

export function mergeFieldOrder(host: PopupSettingHost, fields: FieldInfo[], saved: string[]): string[] {
  const names = fields.map((field) => field.name);
  const known = new Set(names);
  const base = (saved || []).filter((name) => known.has(name));
  const rest = names.filter((name) => !base.includes(name));
  return [...base, ...rest];
}

export const onChartEnabledToggle = (host: PopupSettingHost, e: any) => {
  host.updateAgriConfig({ chartEnabled: !!e?.target?.checked });
};

export const onChartTypeChange = (host: PopupSettingHost, e: any) => {
  host.updateAgriConfig({ chartType: e?.target?.value as "bar" | "line" });
};

export const onChartTitleChange = (host: PopupSettingHost, val: string) => {
  host.updateAgriConfig({ chartTitle: val });
};

export const onChartColorChange = (host: PopupSettingHost, color: string) => {
  host.updateAgriConfig({ chartColor: color });
};

export const onZoomToggle = (host: PopupSettingHost, e: any) => {
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

export const onPopupToggle = (host: PopupSettingHost, e: any) => {
  const val = !!e?.target?.checked;
  const agri = host.getAgriConfig();
  host.setState({ showMapPopup: val });
  host.updateAgriConfig({
    settings: { ...(agri.settings || {}), showMapPopup: val },
  });
};

export const formatFieldLabel = (host: PopupSettingHost, f: FieldInfo): string => {
  const alias = String(f.alias || "").trim();
  const name = String(f.name || "").trim();
  if (alias && alias.toLowerCase() !== name.toLowerCase()) {
    return `${alias} (${name})`;
  }
  return alias || name;
};

export const renderFieldsMultiSelect = (host: PopupSettingHost, selectedItems: string[], onItemClick: (
      evt: React.MouseEvent,
      value: string | number,
      selectedValues: Array<string | number>,
    ) => void, placeholder: string, options?: { menuZIndex?: number; selectKey?: string }) => {
  const { allFields } = host.state;
  const items = Imm(
    allFields.map((f) => ({
      value: f.name,
      label: host.formatFieldLabel(f),
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
          return f ? host.formatFieldLabel(f) : String(v);
        });
        return `${values.length} tanlangan: ${labels.join(", ")}`;
      }}
    />
  );
};

export function render(host: PopupSettingHost) {
  const { useDataSources } = host.props;
  const agri = host.getAgriConfig();
  const dsConnected = !!(useDataSources && useDataSources.length > 0);
  const fieldsToShow = host.state.fieldsToShowLocal;
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
          {host.renderPopupFieldSelect(fieldsToShow)}
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
              onChange={host.onChartEnabledToggle}
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
                  onChange={host.onChartTypeChange}
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
                  onChange={(e) => host.onChartTitleChange(e.target.value)}
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
                {host.renderFieldsMultiSelect(
                  chartFields,
                  host.onChartFieldsMultiSelect,
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
                    onChange={host.onChartColorChange}
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
              checked={host.state.zoomToSelection}
              onChange={host.onZoomToggle}
            />
            <span>Zoom to selection</span>
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Switch
              checked={host.state.showMapPopup}
              onChange={host.onPopupToggle}
            />
            <span>Also open map popup</span>
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Switch
              checked={agri.settings?.showAttachments !== false}
              onChange={host.onAttachmentsToggle}
            />
            <span>Include attachments (Photos &amp; Files)</span>
          </label>
        </div>
      </section>
    </div>
  );
}
