/** @jsx jsx */
import { jsx, React } from "jimu-core";

export const SWIPE_TAG_MIN_SPACE = 104;
const HANDLE_OFFSET_PX = 30;
const YMD = /^(\d{4})-(\d{2})-(\d{2})$/;

export function formatSwipeDate(ymd: string): string {
  const m = YMD.exec(ymd);
  return m ? `${m[3]}.${m[2]}.${m[1]}` : ymd;
}

interface SwipeDateTagsProps {
  mainDate: string;
  compareDate: string;
  position: number;
  viewWidth: number;
  mainLabel: string;
  compareLabel: string;
}

export default function SwipeDateTags(props: SwipeDateTagsProps): JSX.Element {
  const { mainDate, compareDate, viewWidth, mainLabel, compareLabel } = props;
  const position = Math.min(100, Math.max(0, Number.isFinite(props.position) ? props.position : 50));
  const hasWidth = viewWidth > 0;
  const showMain = !hasWidth || (position / 100) * viewWidth >= SWIPE_TAG_MIN_SPACE;
  const showCompare = !hasWidth || ((100 - position) / 100) * viewWidth >= SWIPE_TAG_MIN_SPACE;
  return (
    <div className="agri-field-swipe-tags">
      {showMain && (
        <span
          className="agri-field-swipe-tag agri-field-swipe-tag--main"
          title={`${mainLabel}: ${mainDate}`}
          style={{ right: `calc(${100 - position}% + ${HANDLE_OFFSET_PX}px)` }}
        >
          <span className="agri-field-swipe-tag-sr">{mainLabel}: </span>
          {formatSwipeDate(mainDate)}
        </span>
      )}
      {showCompare && (
        <span
          className="agri-field-swipe-tag agri-field-swipe-tag--compare"
          title={`${compareLabel}: ${compareDate}`}
          style={{ left: `calc(${position}% + ${HANDLE_OFFSET_PX}px)` }}
        >
          <span className="agri-field-swipe-tag-sr">{compareLabel}: </span>
          {formatSwipeDate(compareDate)}
        </span>
      )}
    </div>
  );
}
