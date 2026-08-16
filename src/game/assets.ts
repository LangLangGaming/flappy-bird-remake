import birdPngUrl from '../assets/bird.png'
import pipeHeadUrl from '../assets/pipeHead.png'
import pipeBodyUrl from '../assets/pipeBody.png'
import backgroundUrl from '../assets/Background3.png'
import tilesUrl from '../assets/tiles.png'
import heartUrl from '../assets/heart.png'

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`))
    img.src = src
  })
}

export async function loadGameAssets() {
  const [birdPng, pipeHead, pipeBody, background, floor, heart] = await Promise.allSettled([
    loadImage(birdPngUrl),
    loadImage(pipeHeadUrl),
    loadImage(pipeBodyUrl),
    loadImage(backgroundUrl),
    loadImage(tilesUrl),
    loadImage(heartUrl),
  ])

  const birdImg = birdPng.status === 'fulfilled' ? birdPng.value : null

  return {
    birdImg,
    pipeHead: pipeHead.status === 'fulfilled' ? pipeHead.value : null,
    pipeBody: pipeBody.status === 'fulfilled' ? pipeBody.value : null,
    background: background.status === 'fulfilled' ? background.value : null,
    floor: floor.status === 'fulfilled' ? floor.value : null,
    heart: heart.status === 'fulfilled' ? heart.value : null,
  }
}