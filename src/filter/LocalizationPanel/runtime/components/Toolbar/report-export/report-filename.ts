const UNSAFE_FILENAME_CHARS = /[\\/:*?"<>|]/g;

/**
 * Builds `<part>_<part>_....xlsx`, replacing filename-unsafe characters
 * in every part with "_".
 */
export function safeReportFileName(parts: ReadonlyArray<string | number>): string {
  const name = parts
    .map((part) => String(part).replace(UNSAFE_FILENAME_CHARS, "_"))
    .join("_");
  return `${name}.xlsx`;
}
