# Swipe render harness

Run from the ExB `client` folder:

    npx jest -c your-extensions/widgets/agri/scripts/swipe-harness/jest.config.js

Writes `dist-report/swipe-harness/{loading,ready,error,popover}.html` (real components, real CSS linked by relative path; add `?theme=light` for the light theme). `spike.html` is a standalone ArcGIS 4.34 MediaLayer + Swipe spike; serve it over http (for example `npx http-server`) and open it.
