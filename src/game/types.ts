export type GameState = 'start' | 'playing' | 'respawn' | 'gameover'

export interface Pipe {
  x: number
  gapY: number
  passed?: boolean
  colorIndex?: number
  topSection?: number
  bottomSection?: number
}

export const PIPE_VARIANTS = [
  { body: '#077f4b', cap: '#05693a' }, // green
  { body: '#f59e0b', cap: '#b45309' }, // yellow/orange
  { body: '#ef4444', cap: '#b91c1c' }, // red
  { body: '#06b6d4', cap: '#0891b2' }, // cyan/blue
  { body: '#9ca3af', cap: '#6b7280' }, // gray/white
  { body: '#a78bfa', cap: '#7c3aed' }, // purple
  { body: '#7c2d12', cap: '#5b220e' }, // brown
  { body: '#fb923c', cap: '#ea580c' }, // orange
]

export const CANVAS_W = 480
export const CANVAS_H = 640

export const GRAVITY = 1200 // px/s^2
export const FLAP_STRENGTH = -380 // px/s
export const PIPE_SPEED = 180 // px/s
export const PIPE_INTERVAL = 1500 // ms
export const PIPE_SECTION_W = 32 // source section width in sprite
export const PIPE_SECTION_H = 80 // source section height in sprite
export const PIPE_WIDTH = 64 // displayed logical pipe width (scaled)
export const GAP = 160 // fixed gap height
