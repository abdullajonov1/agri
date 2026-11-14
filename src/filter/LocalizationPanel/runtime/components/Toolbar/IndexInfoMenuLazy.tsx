import { React } from "jimu-core";
import type { IndexInfoMenuProps } from "./IndexInfoMenu";

const IndexInfoMenuContent = React.lazy(async () => {
  const mod = await import("./IndexInfoMenu");
  return { default: mod.IndexInfoMenu };
});

/** Loads the index info menu chunk only once the menu is opened. */
export const IndexInfoMenuLazy = (props: IndexInfoMenuProps) => {
  if (props.openToolbarMenu !== "indexInfo") return null;
  return (
    <React.Suspense fallback={null}>
      <IndexInfoMenuContent {...props} />
    </React.Suspense>
  );
};
