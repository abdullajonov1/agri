/** @jsx jsx */
import { jsx, React } from "jimu-core";
import ReserveCropPanel from "../panels/ReserveCropPanel/runtime/widget";
import { useAgriLandOverlay } from "../store/agri-land-overlay-store";

/**
 * Graff slot: the reserve overlay slides the crop chart up over Index
 * Ko'rsatkichlari. Graff stays mounted underneath so it keeps its state.
 */
export default function AgriGraffReserveSwap(props: { children: React.ReactNode }): JSX.Element {
  const active = useAgriLandOverlay() === "reserve";
  // Stays mounted after the first use so it can slide back out with its bars.
  const everActiveRef = React.useRef(false);
  everActiveRef.current = everActiveRef.current || active;

  return (
    <div className={`agri-dashboard-graff-swap${active ? " is-reserve" : ""}`}>
      <div className="agri-dashboard-graff-swap-pane agri-dashboard-graff-swap-pane--graff" aria-hidden={active}>
        {props.children}
      </div>
      <div className="agri-dashboard-graff-swap-pane agri-dashboard-graff-swap-pane--reserve" aria-hidden={!active}>
        {everActiveRef.current ? <ReserveCropPanel active={active} /> : null}
      </div>
    </div>
  );
}
