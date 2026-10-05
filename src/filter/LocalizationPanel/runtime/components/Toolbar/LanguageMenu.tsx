import { React } from "jimu-core";
import ReactDOM from "react-dom";
import type { FilterState, GeoWidgetState } from "../../widget";

export type LanguageMenuProps = Pick<GeoWidgetState, "openToolbarMenu" | "language"> & {
  _languageToolbarItemRef: React.RefObject<HTMLDivElement>;
  applyLanguage: (lang: FilterState["language"]) => void;
};

export const LanguageMenu = (props: LanguageMenuProps) => {
  if (props.openToolbarMenu !== "language") return null;

  const anchor = props._languageToolbarItemRef.current;
  if (!anchor) return null;
  const rect = anchor.getBoundingClientRect();
  const { language } = props;

  const options: Array<{
    value: FilterState["language"];
    shortLabel: string;
    fullLabel: string;
  }> = [
    { value: "uz_lat", shortLabel: "O'zbek", fullLabel: "O'zbek" },
    { value: "uz_cyr", shortLabel: "Ўзбек", fullLabel: "Ўзбек" },
    { value: "ru", shortLabel: "Русский", fullLabel: "Русский" },
    { value: "en", shortLabel: "English", fullLabel: "English" },
  ];

  return ReactDOM.createPortal(
    <div
      className="agri-v20-toolbar-popover agri-v20-toolbar-popover-floating agri-v20-floating-overlay agri-v20-compact-popover"
      style={{
        position: "fixed",
        top: rect.bottom + 10,
        right: Math.max(12, window.innerWidth - rect.right),
        minWidth: 168,
        zIndex: 2147483001,
      }}
    >
      <div className="agri-v20-language-menu agri-v20-option-menu agri-v20-compact-option-menu">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            className={`agri-v20-language-option agri-v20-compact-option-item ${language === opt.value ? "is-active" : ""}`}
            onClick={() => props.applyLanguage(opt.value)}
            title={opt.fullLabel}
          >
            {opt.shortLabel}
          </button>
        ))}
      </div>
    </div>,
    document.body,
  );
};
