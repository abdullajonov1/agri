# agri — Space Agro Monitoring (Agro_widgetV5 / V6)

## Portal (Experience Builder)

Stable manifest URL (use this in Portal custom widgets):

https://abdullajonov1.github.io/agri/widgets/Agro_widgetV6/manifest.json

After each code change, republish the built package (`bash scripts/publish-agri.sh` from the ExB widget folder). Then in Portal: **Custom widgets → Agro_widgetV6 → Update**.

GitHub Pages updates automatically on push; Portal caches the old build until you click **Update**.

## Local development

Clone this repo into ExB:

`client/your-extensions/widgets/Agro_widgetV5/`

Then `npm start` in the ExB client.

Do **not** register the raw GitHub source URL as a custom widget — Portal needs `widgets/Agro_widgetV6` + `widgets/chunks`.
