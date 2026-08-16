import type { Pipe } from './types'
import { CANVAS_H, CANVAS_W, GAP, PIPE_WIDTH, type GameState } from './types'

export interface RenderContext {
  ctx: CanvasRenderingContext2D
  bg: HTMLImageElement | null
  floor: HTMLImageElement | null
  pipeHead: HTMLImageElement | null
  pipeBody: HTMLImageElement | null
  bird: { x: number; y: number; w: number; h: number; vy: number }
  birdSprite: HTMLImageElement | null
  heartSprite: HTMLImageElement | null
  pipes: Pipe[]
  lives: number
  invulnerableEnd: number | null
  gameState: GameState
  score: number
  bgOffset: number
  now: number
  screenShake: number
}

export function renderGame({
  ctx,
  bg,
  floor,
  pipeHead,
  pipeBody,
  bird,
  birdSprite,
  heartSprite,
  pipes,
  lives,
  invulnerableEnd,
  gameState,
  score,
  bgOffset,
  now,
  screenShake,
}: RenderContext) {
  if (screenShake > 0) {
    ctx.save()
    ctx.translate((Math.random() - 0.5) * screenShake, (Math.random() - 0.5) * screenShake)
  }

  ctx.clearRect(0, 0, CANVAS_W, CANVAS_H)

  if (bg) {
    const bgScale = CANVAS_H / bg.height
    const scaledBgW = bg.width * bgScale
    let offsetX = -bgOffset
    while (offsetX < CANVAS_W) {
      ctx.drawImage(bg, offsetX, 0, scaledBgW, CANVAS_H)
      offsetX += scaledBgW
    }
  } else {
    ctx.fillStyle = '#aee3ff'
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H)
  }

  const groundH = 48
  if (floor) {
    const floorScale = groundH / floor.height
    const scaledFloorW = floor.width * floorScale
    let offsetX = 0
    while (offsetX < CANVAS_W) {
      ctx.drawImage(floor, offsetX, CANVAS_H - groundH, scaledFloorW, groundH)
      offsetX += scaledFloorW
    }
  } else {
    ctx.fillStyle = '#7ec850'
    ctx.fillRect(0, CANVAS_H - groundH, CANVAS_W, groundH)
  }

  if (pipeHead && pipeBody) {
    const headH = pipeHead.height
    const bodyH = pipeBody.height

    pipes.forEach((p) => {
      const topBodyHeight = Math.max(0, p.gapY - headH)
      if (topBodyHeight > 0) {
        let remaining = topBodyHeight
        let destY = 0
        while (remaining > 0) {
          const drawH = Math.min(bodyH, remaining)
          ctx.drawImage(pipeBody, 0, 0, pipeBody.width, drawH, p.x, destY, PIPE_WIDTH, drawH)
          remaining -= drawH
          destY += drawH
        }
      }

      ctx.save()
      ctx.translate(p.x + PIPE_WIDTH / 2, p.gapY)
      ctx.scale(1, -1)
      ctx.drawImage(pipeHead, -PIPE_WIDTH / 2, 0, PIPE_WIDTH, headH)
      ctx.restore()

      const bodyStartY = p.gapY + GAP + headH
      const bottomBodyHeight = Math.max(0, CANVAS_H - 48 - bodyStartY)
      if (bottomBodyHeight > 0) {
        let remaining = bottomBodyHeight
        let destY = bodyStartY
        while (remaining > 0) {
          const drawH = Math.min(bodyH, remaining)
          ctx.drawImage(pipeBody, 0, 0, pipeBody.width, drawH, p.x, destY, PIPE_WIDTH, drawH)
          remaining -= drawH
          destY += drawH
        }
      }

      ctx.drawImage(pipeHead, p.x, p.gapY + GAP, PIPE_WIDTH, headH)
    })
  }

  let drawBird = true
  if (invulnerableEnd && now < invulnerableEnd) {
    const elapsed = now - (invulnerableEnd - 1500)
    drawBird = Math.floor(elapsed / 140) % 2 === 0
  }

  if (drawBird) {
    const angle = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, bird.vy * 0.003))
    ctx.save()
    ctx.translate(bird.x, bird.y)
    ctx.rotate(angle)

    if (birdSprite) {
      const FRAME_W = 16
      const FRAME_H = 16
      const FRAME_DURATION = 100
      const cols = Math.max(1, Math.floor(birdSprite.width / FRAME_W))
      const frameIndex = Math.floor((now % (cols * FRAME_DURATION)) / FRAME_DURATION)
      const sx = frameIndex * FRAME_W
      const sy = 0
      ctx.drawImage(birdSprite, sx, sy, FRAME_W, FRAME_H, -bird.w / 2, -bird.h / 2, bird.w, bird.h)
    } else {
      ctx.fillStyle = '#ffdd57'
      ctx.fillRect(-bird.w / 2, -bird.h / 2, bird.w, bird.h)
      ctx.fillStyle = '#222'
      ctx.fillRect(4, -4, 4, 4)
    }

    ctx.restore()
  }

if (heartSprite) {
  const frameWidth = heartSprite.width / 4
  const frameHeight = heartSprite.height
  const frameDuration = 140
  const frameIndex = Math.floor((now / frameDuration) % 4)
  const iconH = 30
  const iconW = iconH * (frameWidth / frameHeight) // preserve aspect ratio

  for (let i = 0; i < 5; i++) {
    if (i >= lives) continue // lost heart: draw nothing, no placeholder

    const x = 16 + i * 26
    const y = 12
    ctx.drawImage(
      heartSprite,
      frameIndex * frameWidth,
      0,
      frameWidth,
      frameHeight,
      x,
      y,
      iconW,
      iconH,
    )
  }
} else {
  for (let i = 0; i < lives; i++) {
    ctx.fillStyle = '#ef4444'
    ctx.beginPath()
    const x = 16 + i * 26
    const y = 18
    ctx.moveTo(x, y)
    ctx.arc(x - 4, y, 6, 0, Math.PI * 2)
    ctx.arc(x + 4, y, 6, 0, Math.PI * 2)
    ctx.fill()
  }
}

  if (gameState === 'start') {
    ctx.fillStyle = 'rgba(0,0,0,0.5)'
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H)
    ctx.fillStyle = '#fff'
    ctx.textAlign = 'center'
    ctx.font = '28px system-ui'
    ctx.fillText('Click or press Space to Play', CANVAS_W / 2, CANVAS_H / 2)
  }

  if (gameState === 'gameover') {
    ctx.fillStyle = 'rgba(0,0,0,0.6)'
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H)
    ctx.fillStyle = '#fff'
    ctx.textAlign = 'center'
    ctx.font = '36px system-ui'
    ctx.fillText('Game Over', CANVAS_W / 2, CANVAS_H / 2 - 24)
    ctx.font = '20px system-ui'
    ctx.fillText(`Final Score: ${score}`, CANVAS_W / 2, CANVAS_H / 2 + 12)
    ctx.fillText('Click to Restart', CANVAS_W / 2, CANVAS_H / 2 + 48)
  }

  if (screenShake > 0) {
    ctx.restore()
  }
}