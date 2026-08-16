import { useEffect, useRef, useState } from 'react'
import { loadGameAssets } from './assets'
import { renderGame } from './renderGame'
import { updateGameStep } from './updateGame'
import { CANVAS_H, CANVAS_W, FLAP_STRENGTH, GAP, PIPE_INTERVAL, PIPE_SPEED } from './types'
import type { Pipe, GameState } from './types'
import bgMusicUrl from '../assets/sounds/bg.mp3'
import scoreSfxUrl from '../assets/sounds/score.mp3'
import jumpSfxUrl from '../assets/sounds/jump.mp3'
import loseHeartSfxUrl from '../assets/sounds/loseheart.mp3'
import loseGameSfxUrl from '../assets/sounds/losegame.mp3'

export function useGame() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const rafRef = useRef<number | null>(null)
  const lastTimeRef = useRef<number | null>(null)
  const spawnTimerRef = useRef<number>(0)

  const [gameState, setGameState] = useState<GameState>('start')
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(5)

  const scoreRef = useRef(0)
  const livesRef = useRef(5)
  scoreRef.current = score
  livesRef.current = lives

  const bird = useRef({ x: 100, y: CANVAS_H / 2, w: 32, h: 32, vy: 0 })
  const birdImgRef = useRef<HTMLImageElement | null>(null)
  const heartSpriteRef = useRef<HTMLImageElement | null>(null)
  const pipeHeadRef = useRef<HTMLImageElement | null>(null)
  const pipeBodyRef = useRef<HTMLImageElement | null>(null)
  const backgroundRef = useRef<HTMLImageElement | null>(null)
  const floorTilesRef = useRef<HTMLImageElement | null>(null)
  const bgOffsetRef = useRef(0)
  const screenShakeRef = useRef(0)
  const pipes = useRef<Pipe[]>([])
  const invulnerableEndRef = useRef<number | null>(null)
  const INVUL_DURATION = 1500

  const bgMusicRef = useRef<HTMLAudioElement | null>(null)
  const scoreSfxRef = useRef<HTMLAudioElement | null>(null)
  const jumpSfxRef = useRef<HTMLAudioElement | null>(null)
  const loseHeartSfxRef = useRef<HTMLAudioElement | null>(null)
  const loseGameSfxRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    let cancelled = false

    loadGameAssets()
      .then(({ birdImg, pipeHead, pipeBody, background, floor, heart }) => {
        if (cancelled) return
        birdImgRef.current = birdImg
        heartSpriteRef.current = heart
        pipeHeadRef.current = pipeHead
        pipeBodyRef.current = pipeBody
        backgroundRef.current = background
        floorTilesRef.current = floor
      })
      .catch(() => {
        if (!cancelled) {
          birdImgRef.current = null
          heartSpriteRef.current = null
          pipeHeadRef.current = null
          pipeBodyRef.current = null
          backgroundRef.current = null
          floorTilesRef.current = null
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const bgMusic = new Audio(bgMusicUrl)
    bgMusic.loop = true
    bgMusic.volume = 0.5
    bgMusicRef.current = bgMusic

    const scoreSfx = new Audio(scoreSfxUrl)
    scoreSfx.volume = 0.7
    scoreSfxRef.current = scoreSfx

    const jumpSfx = new Audio(jumpSfxUrl)
    jumpSfx.volume = 0.6
    jumpSfxRef.current = jumpSfx

    const loseHeartSfx = new Audio(loseHeartSfxUrl)
    loseHeartSfx.volume = 0.7
    loseHeartSfxRef.current = loseHeartSfx

    const loseGameSfx = new Audio(loseGameSfxUrl)
    loseGameSfx.volume = 0.8
    loseGameSfxRef.current = loseGameSfx

    return () => {
      bgMusic.pause()
      bgMusicRef.current = null
      scoreSfxRef.current = null
      jumpSfxRef.current = null
      loseHeartSfxRef.current = null
      loseGameSfxRef.current = null
    }
  }, [])

  function playFlapSfx() {
    if (jumpSfxRef.current) {
      jumpSfxRef.current.currentTime = 0
      jumpSfxRef.current.play().catch(() => {})
    }
  }

  function resetLevel() {
    bird.current.x = 100
    bird.current.y = CANVAS_H / 2
    bird.current.vy = 0
    pipes.current = []
    spawnTimerRef.current = 0
    bgOffsetRef.current = 0
    setScore(0)
  }

  function spawnPipe() {
    const minGapY = 80
    const maxGapY = CANVAS_H - 80 - GAP
    const gapY = Math.floor(Math.random() * (maxGapY - minGapY + 1)) + minGapY
    pipes.current.push({ x: CANVAS_W + 10, gapY, colorIndex: undefined, topSection: 0, bottomSection: 0 })
  }

  function handleHit() {
    screenShakeRef.current = 4
    setLives((prev) => {
      const newLives = prev - 1
      if (newLives <= 0) {
        setGameState('gameover')
        bgMusicRef.current?.pause()
        if (loseGameSfxRef.current) {
          loseGameSfxRef.current.currentTime = 0
          loseGameSfxRef.current.play().catch(() => {})
        }
      } else {
        invulnerableEndRef.current = performance.now() + INVUL_DURATION
        if (loseHeartSfxRef.current) {
          loseHeartSfxRef.current.currentTime = 0
          loseHeartSfxRef.current.play().catch(() => {})
        }
      }
      return newLives
    })
  }

  function startGame() {
    setLives(5)
    resetLevel()
    setGameState('playing')
    bgMusicRef.current?.play().catch(() => {})
  }

  function restart() {
    setLives(5)
    resetLevel()
    setGameState('playing')
    bgMusicRef.current?.play().catch(() => {})
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.code === 'Space') {
        e.preventDefault()
        if (gameState === 'start') startGame()
        if (gameState === 'gameover') return
        if (gameState === 'respawn') return
        bird.current.vy = FLAP_STRENGTH
        playFlapSfx()
      }
    }

    function onClick() {
      if (gameState === 'start') startGame()
      if (gameState === 'gameover') return
      if (gameState === 'respawn') return
      bird.current.vy = FLAP_STRENGTH
      playFlapSfx()
    }

    window.addEventListener('keydown', onKey)
    window.addEventListener('click', onClick)

    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('click', onClick)
    }
  }, [gameState])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!

    function loop(ts: number) {
      if (!lastTimeRef.current) lastTimeRef.current = ts
      const dt = Math.min(50, ts - lastTimeRef.current) / 1000
      lastTimeRef.current = ts

      screenShakeRef.current = Math.max(0, screenShakeRef.current - dt * 28)

      if (gameState === 'playing') {
        spawnTimerRef.current += dt * 1000
        if (spawnTimerRef.current >= PIPE_INTERVAL) {
          spawnPipe()
          spawnTimerRef.current = 0
        }

        const update = updateGameStep({
          dt,
          bird: bird.current,
          pipes: pipes.current,
          invulnerableEnd: invulnerableEndRef.current,
          now: ts,
        })

        bird.current = update.bird
        pipes.current = update.pipes

        if (update.scoreDelta > 0) {
          setScore((prev) => prev + update.scoreDelta)
          if (scoreSfxRef.current) {
            scoreSfxRef.current.currentTime = 0
            scoreSfxRef.current.play().catch(() => {})
          }
        }

        if (update.collided) {
          handleHit()
        }

        if (backgroundRef.current) {
          const bgScale = CANVAS_H / backgroundRef.current.height
          const scaledBgW = backgroundRef.current.width * bgScale
          bgOffsetRef.current = (bgOffsetRef.current + PIPE_SPEED * dt) % scaledBgW
        }
      }

      renderGame({
        ctx,
        bg: backgroundRef.current,
        floor: floorTilesRef.current,
        pipeHead: pipeHeadRef.current,
        pipeBody: pipeBodyRef.current,
        bird: bird.current,
        birdSprite: birdImgRef.current,
        heartSprite: heartSpriteRef.current,
        pipes: pipes.current,
        lives: livesRef.current,
        invulnerableEnd: invulnerableEndRef.current,
        gameState,
        score: scoreRef.current,
        bgOffset: bgOffsetRef.current,
        now: ts,
        screenShake: screenShakeRef.current,
      })

      rafRef.current = requestAnimationFrame(loop)
    }

    rafRef.current = requestAnimationFrame(loop)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      lastTimeRef.current = null
    }
  }, [gameState])

  useEffect(() => {
    function onCanvasClick() {
      if (gameState === 'gameover') restart()
    }
    const c = canvasRef.current
    c?.addEventListener('click', onCanvasClick)
    return () => c?.removeEventListener('click', onCanvasClick)
  }, [gameState])

  return {
    canvasRef,
    score,
    lives,
  }
}