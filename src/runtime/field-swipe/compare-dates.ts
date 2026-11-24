type MaybeDate = string | null | undefined
type DateList = readonly string[] | null | undefined

export function isSelectableCompareDate (
  ymd: MaybeDate,
  mainDate: MaybeDate,
  availableDates: DateList
): boolean {
  if (!ymd || ymd === mainDate) return false
  return (availableDates ?? []).includes(ymd)
}

export function reconcileCompareDate (
  compareDate: MaybeDate,
  mainDate: MaybeDate,
  availableDates: DateList
): string | null {
  if (!compareDate || !mainDate) return null
  // The chart briefly broadcasts no dates while reloading: keep the current value.
  if (!availableDates || availableDates.length === 0) return compareDate
  return isSelectableCompareDate(compareDate, mainDate, availableDates) ? compareDate : null
}

export function isSwipeActive (compareDate: MaybeDate, mainDate: MaybeDate): boolean {
  return Boolean(compareDate) && Boolean(mainDate) && compareDate !== mainDate
}
