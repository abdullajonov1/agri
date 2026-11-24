export interface SwipeCompareState {
  readonly active: boolean
  readonly position: number
}

const MIN_POSITION = 0
const MAX_POSITION = 100
const DEFAULT_STATE: SwipeCompareState = Object.freeze({ active: false, position: 50 })

let state: SwipeCompareState = DEFAULT_STATE

export function getSwipeCompareState(): SwipeCompareState {
  return state
}

export function setSwipeCompareState(next: Partial<SwipeCompareState>): SwipeCompareState {
  const nextPosition =
    typeof next.position === "number" && !Number.isNaN(next.position)
      ? Math.min(MAX_POSITION, Math.max(MIN_POSITION, next.position))
      : state.position
  state = Object.freeze({
    active: typeof next.active === "boolean" ? next.active : state.active,
    position: nextPosition
  })
  return state
}

export function isOnTrailingSide(screenX: number, viewWidth: number): boolean {
  if (!state.active || !(viewWidth > 0)) return false
  return (screenX / viewWidth) * 100 > state.position
}

export function resetSwipeCompareState(): void {
  state = DEFAULT_STATE
}
