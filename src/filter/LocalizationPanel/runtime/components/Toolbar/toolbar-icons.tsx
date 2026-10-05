import { React } from "jimu-core";
import { Bell, Calendar, Info } from "lucide-react";
import languageDarkIcon from "../../../assets/Frame.svg";
import languageLightIcon from "../../../assets/Frame-light.svg";
import languageActiveIcon from "../../../assets/Frame-1.svg";

export const CalendarIcon = () => (
  <Calendar className="agri-toolbar-svg" strokeWidth={1.8} aria-hidden="true" />
);

export const InfoIcon = () => (
  <Info className="agri-toolbar-svg" strokeWidth={1.8} aria-hidden="true" />
);

export const BellIcon = () => (
  <Bell className="agri-toolbar-svg" strokeWidth={1.8} aria-hidden="true" />
);

export const LanguageIcon = (props: { active: boolean; isLight: boolean }) => (
  <span
    className={[
      "agri-language-toolbar-icon",
      props.isLight ? "theme-light" : "theme-dark",
      props.active ? "is-active" : "",
    ]
      .filter(Boolean)
      .join(" ")}
    aria-hidden="true"
  >
    <img
      className="agri-language-icon-layer agri-language-icon-dark"
      src={languageDarkIcon}
      alt=""
      decoding="async"
    />
    <img
      className="agri-language-icon-layer agri-language-icon-light"
      src={languageLightIcon}
      alt=""
      decoding="async"
    />
    <img
      className="agri-language-icon-layer agri-language-icon-accent"
      src={languageActiveIcon}
      alt=""
      decoding="async"
    />
  </span>
);

export const SunIcon = ({
  className,
  size = 14,
}: {
  className?: string;
  size?: number;
}) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    width={size}
    height={size}
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
    <path
      d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

export const MoonIcon = ({
  className,
  size = 14,
}: {
  className?: string;
  size?: number;
}) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    width={size}
    height={size}
    aria-hidden="true"
  >
    <path
      d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const LogoutIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className="agri-toolbar-svg agri-logout-svg"
    aria-hidden="true"
  >
    <path
      d="M15 17l5-5-5-5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M20 12H9"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 20H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
