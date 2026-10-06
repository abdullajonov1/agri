import { React } from "jimu-core";
import ReactDOM from "react-dom";
import type { GeoWidgetState } from "../../widget";

export type YilMenuProps = Pick<GeoWidgetState, "openToolbarMenu" | "yilOptions" | "yil" | "language"> & {
  _yilToolbarItemRef: React.RefObject<HTMLDivElement>;
  applyYil: (selectedYil: string) => void;
};

export const YilMenu = (props: YilMenuProps) => {
  if (props.openToolbarMenu !== "yil") return null;

  const anchor = props._yilToolbarItemRef.current;
  if (!anchor) return null;
  const rect = anchor.getBoundingClientRect();
  const { yilOptions, yil, language } = props;

  const headerLabel =
    language === "en" ? "Year" : language === "ru" ? "Год" : language === "uz_lat" ? "Yil" : "Йил";

  return ReactDOM.createPortal(
    <div
      className="agri-v20-toolbar-popover agri-v20-toolbar-popover-floating agri-v20-floating-overlay agri-v20-yil-popover"
      style={{
        position: "fixed",
        top: rect.bottom + 10,
        left: Math.max(12, rect.left),
        minWidth: 156,
        zIndex: 2147483001,
      }}
    >
      <div
        className="agri-v20-option-menu agri-v20-yil-option-menu"
        role="menu"
        aria-label={headerLabel}
      >
        {yilOptions
          .map((opt) => String(opt).trim())
          .filter((value) => value.length > 0)
          .map((value) => {
            return (
              <button
                key={value}
                type="button"
                className={`agri-v20-option-item agri-v20-yil-option-item ${yil === value ? "is-active" : ""}`}
                onClick={() => props.applyYil(value)}
              >
                {value}
              </button>
            );
          })}
      </div>
    </div>,
    document.body,
  );
};
