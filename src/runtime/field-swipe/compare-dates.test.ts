import {
  isSelectableCompareDate,
  isSwipeActive,
  reconcileCompareDate
} from './compare-dates'

describe('isSelectableCompareDate', () => {
  const available = ['2025-05-01', '2025-05-10', '2025-05-20']

  it('accepts an available date different from the main date', () => {
    expect(isSelectableCompareDate('2025-05-01', '2025-05-10', available)).toBe(true)
  })

  it('rejects the main date', () => {
    expect(isSelectableCompareDate('2025-05-10', '2025-05-10', available)).toBe(false)
  })

  it('rejects a date that is not available', () => {
    expect(isSelectableCompareDate('2025-06-01', '2025-05-10', available)).toBe(false)
  })

  it('rejects an empty date', () => {
    expect(isSelectableCompareDate('', '2025-05-10', available)).toBe(false)
  })
})

describe('reconcileCompareDate', () => {
  const available = ['2025-05-01', '2025-05-10', '2025-05-20']

  it('keeps a still selectable date', () => {
    expect(reconcileCompareDate('2025-05-01', '2025-05-10', available)).toBe('2025-05-01')
  })

  it('returns null when the date equals the main date', () => {
    expect(reconcileCompareDate('2025-05-10', '2025-05-10', available)).toBeNull()
  })

  it('returns null when the date is no longer available', () => {
    expect(reconcileCompareDate('2025-06-01', '2025-05-10', available)).toBeNull()
  })

  it('returns null for null or empty compare date', () => {
    expect(reconcileCompareDate(null, '2025-05-10', available)).toBeNull()
    expect(reconcileCompareDate('', '2025-05-10', available)).toBeNull()
  })

  it('returns null for null or empty main date', () => {
    expect(reconcileCompareDate('2025-05-01', null, available)).toBeNull()
    expect(reconcileCompareDate('2025-05-01', '', available)).toBeNull()
  })

  it('keeps the compare date when the available list is empty', () => {
    expect(reconcileCompareDate('2025-05-01', '2025-05-10', [])).toBe('2025-05-01')
  })

  it('treats a missing available list as empty', () => {
    expect(reconcileCompareDate('2025-05-01', '2025-05-10', null)).toBe('2025-05-01')
  })

  it('does not mutate the input list', () => {
    const input = Object.freeze([...available])
    expect(reconcileCompareDate('2025-05-01', '2025-05-10', input)).toBe('2025-05-01')
    expect(input).toEqual(available)
  })
})

describe('isSwipeActive', () => {
  it('is true when both dates are set and differ', () => {
    expect(isSwipeActive('2025-05-01', '2025-05-10')).toBe(true)
  })

  it('is false when the dates are equal', () => {
    expect(isSwipeActive('2025-05-10', '2025-05-10')).toBe(false)
  })

  it('is false when either date is missing', () => {
    expect(isSwipeActive(null, '2025-05-10')).toBe(false)
    expect(isSwipeActive('2025-05-01', null)).toBe(false)
    expect(isSwipeActive('', '2025-05-10')).toBe(false)
    expect(isSwipeActive('2025-05-01', '')).toBe(false)
  })
})
