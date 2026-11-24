# Swipe render harness

Run from the ExB `client` folder:

    npx jest -c your-extensions/widgets/agri/scripts/swipe-harness/jest.config.js

Writes `dist-report/swipe-harness/{popover,active,loading,popover-error}.html` from the real `FieldComparePanel` (swipe controller mocked, status per page) with the real CSS linked by relative path; add `?theme=light` for the light theme. The map box is 380px tall like the real app. Pages: `popover` (calendar open), `active` (compare date picked, ready, Swipe button active; the panel gets a view whose container is a host div, so the `SwipeDateTags` portal renders both date tags into the map box next to a white divider line and 40px handle circle at 50%), `loading` (button is-loading), `popover-error` (error alert with Retry in the open popover). `gate.cjs` is the browser gate over these pages; on `active` it also checks that both date tags are visible, single line (height <= 30px, no clipping), >= 12px, contrast >= 4.5 on light/mid/dark backdrops, inside the map box and clear of the handle circle. `spike.html` is a standalone ArcGIS 4.34 MediaLayer + Swipe spike; serve it over http (for example `npx http-server`) and open it.
