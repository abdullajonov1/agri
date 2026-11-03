/** @jsx jsx */
import { jsx, React } from "jimu-core";
import { useAgriLandOverlay } from "../store/agri-land-overlay-store";

/**
 * Pie (crop type) and VH do not apply to reserve land: while the reserve
 * overlay is on they fade out and take no clicks, taps or keyboard focus.
 */
export default function AgriReserveLock(props: { children: React.ReactNode }): JSX.Element {
  const locked = useAgriLandOverlay() === "reserve";
  const ref = React.useRef<HTMLDivElement>(null);

  // `inert` keeps Tab focus out too; React 17/18 typings lack the prop.
  React.useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (locked) node.setAttribute("inert", "");
    else node.removeAttribute("inert");
  }, [locked]);

  return (
    <div
      ref={ref}
      className={`agri-dashboard-reserve-lock${locked ? " is-locked" : ""}`}
      aria-disabled={locked || undefined}
    >
      {props.children}
    </div>
  );
}
