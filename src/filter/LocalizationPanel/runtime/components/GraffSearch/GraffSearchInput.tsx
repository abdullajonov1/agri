import { React } from "jimu-core";
import type { GeoWidgetState } from "../../widget";

export type GraffSearchInputProps = Pick<GeoWidgetState, "graffSearchText" | "language"> & {
  _graffSearchWrapRef: React.RefObject<HTMLDivElement>;
  handleGraffSearchInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleGraffSearchFocus: () => void;
  handleGraffSearchClear: () => void;
};

export const GraffSearchInput = (props: GraffSearchInputProps) => {
  const { graffSearchText, language } = props;

  const graffSearchPlaceholder =
  language === "en"
    ? "TIN or farmer name"
    : language === "ru"
      ? "ИНН или название фермера"
    : language === "uz_lat"
      ? "STIR yoki fermer nomi"
      : "СТИР ёки фермер номи";

  return (
  <div
    className="agri-v20-graff-search-wrap"
    ref={props._graffSearchWrapRef}
  >
    <span className="agri-v20-graff-search-icon">
      <SearchIcon />
    </span>
    <input
      className="agri-v20-graff-search-input"
      type="text"
      value={graffSearchText}
      onChange={props.handleGraffSearchInputChange}
      onFocus={props.handleGraffSearchFocus}
      placeholder={graffSearchPlaceholder}
      autoComplete="off"
    />
    {graffSearchText ? (
      <button
        type="button"
        className="agri-v20-graff-search-clear"
        onClick={props.handleGraffSearchClear}
        aria-label={
          language === "en"
            ? "Clear"
            : language === "ru"
            ? "Очистить"
            : language === "uz_lat"
              ? "Tozalash"
              : "Тозалаш"
        }
        title={
          language === "en"
            ? "Clear"
            : language === "ru"
            ? "Очистить"
            : language === "uz_lat"
              ? "Tozalash"
              : "Тозалаш"
        }
      >
        ×
      </button>
    ) : null}
  </div>
  );
};

export const SearchIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className="agri-search-svg"
    aria-hidden="true"
  >
    <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.8" />
    <path
      d="M16 16 20 20"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
);
