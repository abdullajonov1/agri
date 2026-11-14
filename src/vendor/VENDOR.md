# Vendored library: xlsx-populate

## Library

- **Name:** xlsx-populate (browser build, `xlsx-populate.browser.js`)
- **Version:** unknown. Evidence checked: the bundle contains no `"name"`, `"version"`, `"license"` or `"repository"` package metadata for xlsx-populate itself (grep for those keys and for `xlsx-populate` returned only the shim-related error string `xlsx-populate:${name}` and the `XlsxPopulate` global export). The only version-like strings are unrelated bundled dependencies (JSZip, buffer, base64-js, safe-buffer).
- **Upstream:** https://github.com/dtjohnson/xlsx-populate
- **Licence:** MIT (per upstream). The bundle carries the MIT notices of its bundled dependencies (for example base64-js, buffer, safe-buffer) and JSZip notices.
- **File SHA-256:** `fb8f9d758e70a7d084e14b9f265d19086d972b19c18ef6dd0a41a18893c7e3ad`
- **Size:** 1,065,100 bytes (30,523 lines), as of the last check.

## Use in this project

Used only to fill the embedded Excel report templates (keeps template styles, merges, column widths and number formats intact). The only consumers are under `src/filter/LocalizationPanel/runtime/components/Toolbar/report-export/` (`fill-workbook.ts`, `fill-fermer-workbook.ts`, and their tests), which load it through the lazy loader in `xlsx-populate-shim.ts`. It is loaded only when the user clicks the Excel toolbar button.

## Files in this folder

- `xlsx-populate.browser.js`: vendored bundle (the file hashed above).
- `xlsx-populate.browser.js.d.ts`: type declaration (`XlsxPopulate: any`, default and `export =`).
- `xlsx-populate-shim.ts`: lazy loader (`loadXlsxPopulate`) and the local type definitions for the parts of the API this project uses.

## Re-verify the hash

From the repository root:

```
node -e "const fs=require('fs'),c=require('crypto');const d='client/your-extensions/widgets/agri-main/src/vendor/';console.log(c.createHash('sha256').update(fs.readFileSync(d+'xlsx-populate.browser.js')).digest('hex'))"
```

Compare the output with the SHA-256 above. A mismatch means the bundle changed and this record must be updated.

## How to update

1. Obtain the new build from the upstream release (https://github.com/dtjohnson/xlsx-populate, the browser build of the chosen tag).
2. Replace `xlsx-populate.browser.js` and, if the API changed, `xlsx-populate.browser.js.d.ts` and `xlsx-populate-shim.ts`.
3. Record the new version (from the upstream tag or `package.json`), licence check and the new SHA-256 in this file.
4. Run the re-verify command above and the report-export tests before committing.
