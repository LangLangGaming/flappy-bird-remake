import { useGame } from '../game/useGame'
import { CANVAS_W, CANVAS_H } from '../game/types'

export default function GameCanvas() {
  const { canvasRef, score, lives } = useGame()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-sky-100 gap-4">

      <div className="shadow-lg" style={{ width: CANVAS_W, position: 'relative' }}>
        <canvas
          ref={canvasRef}
          width={CANVAS_W}
          height={CANVAS_H}
          className="block"
          style={{ display: 'block', width: '100%', height: 'auto' }}
        />

        <div className="px-3 py-2 bg-white flex items-center justify-between">
          <div className="text-sm">Score: {score}</div>
          <div className="text-sm">Lives: {lives}</div>
        </div>
      </div>
    </div>
  )
}