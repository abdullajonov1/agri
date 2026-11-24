import {
  getSwipeCompareState,
  isOnTrailingSide,
  resetSwipeCompareState,
  setSwipeCompareState
} from "./agri-swipe-state"

describe("agri-swipe-state", () => {
  beforeEach(() => resetSwipeCompareState())

  test("defaults to inactive at 50", () => {
    expect(getSwipeCompareState()).toEqual({ active: false, position: 50 })
  })

  test("returns a new frozen object on each set", () => {
    const before = getSwipeCompareState()
    const next = setSwipeCompareState({ active: true })
    expect(next).not.toBe(before)
    expect(Object.isFrozen(next)).toBe(true)
    expect(before.active).toBe(false)
    expect(getSwipeCompareState()).toBe(next)
  })

  test("clamps position to 0-100", () => {
    expect(setSwipeCompareState({ position: -10 }).position).toBe(0)
    expect(setSwipeCompareState({ position: 250 }).position).toBe(100)
  })

  test("ignores NaN position", () => {
    setSwipeCompareState({ position: 30 })
    expect(setSwipeCompareState({ position: NaN }).position).toBe(30)
  })

  test("isOnTrailingSide is false when inactive or width invalid", () => {
    expect(isOnTrailingSide(900, 1000)).toBe(false)
    setSwipeCompareState({ active: true, position: 50 })
    expect(isOnTrailingSide(900, 0)).toBe(false)
    expect(isOnTrailingSide(900, -5)).toBe(false)
  })

  test("isOnTrailingSide compares against position when active", () => {
    setSwipeCompareState({ active: true, position: 50 })
    expect(isOnTrailingSide(600, 1000)).toBe(true)
    expect(isOnTrailingSide(500, 1000)).toBe(false)
    expect(isOnTrailingSide(100, 1000)).toBe(false)
  })
})
