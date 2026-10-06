import { ReactDOM, React, Immutable } from "jimu-core";
import { MultiSelect, Switch, Select, Option, TextInput, type MultiSelectItem } from "jimu-ui";
import { ColorPicker } from "jimu-ui/basic/color-picker";
import type { PopupSettingHost } from "../popup-setting-host";

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

export const renderFieldsMultiSelect = (host: PopupSettingHost, selectedItems: string[], onItemClick: (
      evt: React.MouseEvent,
      value: string | number,
      selectedValues: Array<string | number>,
    ) => void, placeholder: string, options?: { menuZIndex?: number; selectKey?: string }) => {
  const { allFields } = host.state;
  const items = Immutable.from<MultiSelectItem[]>(
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
      items={items}
      values={Immutable.from<Array<string | number>>(selectedItems)}
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
