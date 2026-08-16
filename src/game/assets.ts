export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`))
    img.src = src
  })
}

export async function loadGameAssets() {
  const [birdPng, bird2x, pipeHead, pipeBody, background, floor, heart] = await Promise.allSettled([
    loadImage('/src/assets/bird.png'),
    loadImage('/src/assets/bird@2x.png'),
    loadImage('/src/assets/pipeHead.png'),
    loadImage('/src/assets/pipeBody.png'),
    loadImage('/src/assets/Background3.png'),
    loadImage('/src/assets/tiles.png'),
    loadImage('/src/assets/heart.png'),
  ])

  const birdImg = bird2x.status === 'fulfilled' && window.devicePixelRatio >= 2 ? bird2x.value : birdPng.status === 'fulfilled' ? birdPng.value : null

  return {
    birdImg,
    pipeHead: pipeHead.status === 'fulfilled' ? pipeHead.value : null,
    pipeBody: pipeBody.status === 'fulfilled' ? pipeBody.value : null,
    background: background.status === 'fulfilled' ? background.value : null,
    floor: floor.status === 'fulfilled' ? floor.value : null,
    heart: heart.status === 'fulfilled' ? heart.value : null,
  }
}
