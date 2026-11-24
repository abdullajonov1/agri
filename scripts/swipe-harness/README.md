# Swipe render harness

Run from the ExB `client` folder:

    npx jest -c your-extensions/widgets/agri/scripts/swipe-harness/jest.config.js

Writes `dist-report/swipe-harness/{popover,active,loading,popover-error}.html` from the real `FieldComparePanel` (swipe controller mocked, status per page) with the real CSS linked by relative path; add `?theme=light` for the light theme. The map box is 380px tall like the real app. Pages: `popover` (calendar open), `active` (compare date picked, ready, Swipe button active), `loading` (button is-loading), `popover-error` (error alert with Retry in the open popover). `gate.cjs` is the browser gate over these pages. `spike.html` is a standalone ArcGIS 4.34 MediaLayer + Swipe spike; serve it over http (for example `npx http-server`) and open it.
