import { CANVAS_H, GAP, GRAVITY, PIPE_SPEED, PIPE_WIDTH, type Pipe } from './types'

export interface UpdateGameInput {
  dt: number
  bird: { x: number; y: number; w: number; h: number; vy: number }
  pipes: Pipe[]
  invulnerableEnd: number | null
  now: number
}

export interface UpdateGameResult {
  bird: { x: number; y: number; w: number; h: number; vy: number }
  pipes: Pipe[]
  scoreDelta: number
  collided: boolean
}

export function updateGameStep({ dt, bird, pipes, invulnerableEnd, now }: UpdateGameInput): UpdateGameResult {
  const nextBird = { ...bird }
  const groundY = CANVAS_H - 48

  nextBird.vy += GRAVITY * dt
  nextBird.y += nextBird.vy * dt

  // Hard physical bounds - bird can never leave the canvas, regardless of
  // collision/invulnerability state below.
  if (nextBird.y - nextBird.h / 2 <= 0) {
    nextBird.y = nextBird.h / 2
    nextBird.vy = Math.max(0, nextBird.vy)
  }

  if (nextBird.y + nextBird.h / 2 >= groundY) {
    nextBird.y = groundY - nextBird.h / 2
    nextBird.vy = Math.max(0, nextBird.vy)
  }

  let nextPipes = pipes.map((pipe) => ({ ...pipe }))
  nextPipes.forEach((pipe) => {
    pipe.x -= PIPE_SPEED * dt
  })
  nextPipes = nextPipes.filter((pipe) => pipe.x + PIPE_WIDTH > -50)

  let scoreDelta = 0
  let collided = false

  for (const pipe of nextPipes) {
    if (!pipe.passed && pipe.x + PIPE_WIDTH < nextBird.x) {
      pipe.passed = true
      scoreDelta += 1
    }

    if (invulnerableEnd && now < invulnerableEnd) {
      continue
    }

    const bx = nextBird.x
    const by = nextBird.y
    const bw = nextBird.w
    const bh = nextBird.h
    const topRect = { x: pipe.x, y: 0, w: PIPE_WIDTH, h: pipe.gapY }
    const bottomRect = {
      x: pipe.x,
      y: pipe.gapY + GAP,
      w: PIPE_WIDTH,
      h: CANVAS_H - (pipe.gapY + GAP),
    }

    const hitTop =
      bx + bw / 2 > topRect.x &&
      bx - bw / 2 < topRect.x + topRect.w &&
      by + bh / 2 > topRect.y &&
      by - bh / 2 < topRect.y + topRect.h

    const hitBottom =
      bx + bw / 2 > bottomRect.x &&
      bx - bw / 2 < bottomRect.x + bottomRect.w &&
      by + bh / 2 > bottomRect.y &&
      by - bh / 2 < bottomRect.y + bottomRect.h

    if (hitTop || hitBottom) {
      collided = true
      break
    }
  }

  if (!collided && !(invulnerableEnd && now < invulnerableEnd)) {
    if (nextBird.y - nextBird.h / 2 <= 0) {
      nextBird.y = nextBird.h / 2
      nextBird.vy = Math.max(nextBird.vy, 0)
      collided = true
    }

    if (nextBird.y + nextBird.h / 2 >= groundY) {
      nextBird.y = groundY - nextBird.h / 2
      nextBird.vy = Math.max(nextBird.vy, 0)
      collided = true
    }
  }

  return {
    bird: nextBird,
    pipes: nextPipes,
    scoreDelta,
    collided,
  }
}