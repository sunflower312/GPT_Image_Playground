async function fetchImageBlob(src: string): Promise<Blob> {
  const response = await fetch(src)
  if (!response.ok) {
    throw new Error(`图片读取失败：HTTP ${response.status}`)
  }

  return response.blob()
}

function canvasToPngBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob)
        return
      }

      reject(new Error('图片转换为 PNG 失败'))
    }, 'image/png')
  })
}

async function decodeImageBlob(blob: Blob): Promise<{
  source: CanvasImageSource
  width: number
  height: number
  release: () => void
}> {
  if (typeof createImageBitmap === 'function') {
    try {
      const bitmap = await createImageBitmap(blob)
      return {
        source: bitmap,
        width: bitmap.width,
        height: bitmap.height,
        release: () => bitmap.close(),
      }
    } catch {
      // 回退到 HTMLImageElement，兼容部分浏览器对 createImageBitmap 的格式限制。
    }
  }

  const objectUrl = URL.createObjectURL(blob)
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const element = new Image()
      element.onload = () => resolve(element)
      element.onerror = () => reject(new Error('图片解码失败，无法复制'))
      element.src = objectUrl
    })

    return {
      source: image,
      width: image.naturalWidth || image.width,
      height: image.naturalHeight || image.height,
      release: () => URL.revokeObjectURL(objectUrl),
    }
  } catch (error) {
    URL.revokeObjectURL(objectUrl)
    throw error
  }
}

async function convertImageBlobToPng(blob: Blob): Promise<Blob> {
  const decoded = await decodeImageBlob(blob)
  try {
    const canvas = document.createElement('canvas')
    canvas.width = decoded.width
    canvas.height = decoded.height

    const context = canvas.getContext('2d')
    if (!context) {
      throw new Error('浏览器不支持 2D Canvas，无法复制图片')
    }

    context.drawImage(decoded.source, 0, 0)
    return canvasToPngBlob(canvas)
  } finally {
    decoded.release()
  }
}

function canWriteClipboardImage(mimeType: string): boolean {
  if (typeof ClipboardItem !== 'function') {
    return false
  }

  const clipboardItem = ClipboardItem as typeof ClipboardItem & {
    supports?: (type: string) => boolean
  }

  return typeof clipboardItem.supports === 'function' ? clipboardItem.supports(mimeType) : true
}

export async function copyImageToClipboard(src: string): Promise<void> {
  if (!navigator.clipboard?.write || typeof ClipboardItem !== 'function') {
    throw new Error('当前浏览器不支持复制图片到剪贴板')
  }

  const sourceBlob = await fetchImageBlob(src)
  const sourceMimeType = sourceBlob.type || 'application/octet-stream'
  const clipboardBlob =
    sourceMimeType === 'image/png' && canWriteClipboardImage(sourceMimeType)
      ? sourceBlob
      : await convertImageBlobToPng(sourceBlob)

  const clipboardMimeType = clipboardBlob.type || 'image/png'
  if (!canWriteClipboardImage(clipboardMimeType)) {
    throw new Error(`当前浏览器不支持复制 ${clipboardMimeType} 图片`)
  }

  await navigator.clipboard.write([
    new ClipboardItem({
      [clipboardMimeType]: clipboardBlob,
    }),
  ])
}
