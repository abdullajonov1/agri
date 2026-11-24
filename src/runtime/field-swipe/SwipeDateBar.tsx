/** @jsx jsx */
import { jsx, React } from "jimu-core";
import AgriDashboardSpinner from "../../shared/AgriDashboardSpinner";
import { SWIPE_COPY, type SwipeLanguage } from "./swipe-copy";
import "./field-swipe.css";

export type SwipeBarStatus = "loading" | "ready" | "error";
export type SwipeSide = "main" | "compare";

interface Props {
  language: SwipeLanguage;
  mainDate: string;
  compareDate: string;
  status: SwipeBarStatus;
  onClose: () => void;
  onRetry: () => void;
  onFocusSide: (side: SwipeSide) => void;
}

const SPINNER_SIZE = 16;

const stopPointer = (event: React.PointerEvent<HTMLElement>): void => {
  event.stopPropagation();
};

export default function SwipeDateBar({
  language,
  mainDate,
  compareDate,
  status,
  onClose,
  onRetry,
  onFocusSide,
}: Props): JSX.Element {
  const copy = SWIPE_COPY[language] ?? SWIPE_COPY.en;
  const isLoading = status === "loading";
  const isError = status === "error";

  return (
    <div
      className={`agri-field-swipe-bar${status === "error" ? " is-error" : ""}`}
      onPointerDown={stopPointer}
    >
      <button
        type="button"
        className="agri-field-swipe-chip agri-field-swipe-chip--main"
        onClick={() => { onFocusSide("main"); }}
      >
        <span className="agri-field-swipe-hint" aria-hidden="true">←</span>
        <span className="agri-field-swipe-dot" aria-hidden="true" />
        <span className="agri-field-swipe-caption">{copy.main}</span>
        <span>{mainDate}</span>
      </button>
      {isError ? (
        <div className="agri-field-swipe-error-group">
          <span className="agri-field-swipe-error">{copy.error}</span>
          <button type="button" className="agri-field-swipe-retry" onClick={onRetry}>
            {copy.retry}
          </button>
        </div>
      ) : (
        <button
          type="button"
          className="agri-field-swipe-chip agri-field-swipe-chip--compare"
          aria-busy={isLoading ? "true" : "false"}
          onClick={() => { onFocusSide("compare"); }}
        >
          {isLoading ? (
            <AgriDashboardSpinner
              className="agri-field-swipe-spinner"
              size={SPINNER_SIZE}
              ariaLabel={copy.loading}
            />
          ) : (
            <span className="agri-field-swipe-dot" aria-hidden="true" />
          )}
          <span className="agri-field-swipe-caption">{copy.compare}</span>
          <span>{compareDate}</span>
          <span className="agri-field-swipe-hint" aria-hidden="true">→</span>
        </button>
      )}
      <button
        type="button"
        className="agri-field-swipe-close"
        aria-label={copy.close}
        title={copy.close}
        onClick={onClose}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <path d="M3.5 3.5l9 9M12.5 3.5l-9 9" />
        </svg>
      </button>
    </div>
  );
}
