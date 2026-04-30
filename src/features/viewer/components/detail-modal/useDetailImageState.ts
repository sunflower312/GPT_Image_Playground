import { useEffect, useRef, useState } from 'react'
import type { TaskRecord } from '../../../../types'
import {
  ensureCachedImageMetadata,
  ensureImageCached,
  getCachedImage,
  getCachedImageMetadata,
} from '../../../../store/cache'
import { formatImageRatio } from '../../../../lib/size'

export function useDetailImageState(task: TaskRecord | null, detailTaskId: string | null) {
  const [imageIndex, setImageIndex] = useState(0)
  const [imageSrcs, setImageSrcs] = useState<Record<string, string>>({})
  const [imageRatios, setImageRatios] = useState<Record<string, string>>({})
  const [imageSizes, setImageSizes] = useState<Record<string, string>>({})
  const [imageLabelLeft, setImageLabelLeft] = useState(8)
  const imagePanelRef = useRef<HTMLDivElement | null>(null)
  const mainImageRef = useRef<HTMLImageElement | null>(null)

  useEffect(() => {
    setImageIndex(0)
  }, [detailTaskId])

  useEffect(() => {
    if (!task) return

    let cancelled = false
    const ids = [...(task.outputImages || []), ...(task.inputImageIds || [])]

    for (const id of ids) {
      const cached = getCachedImage(id, 'original')
      if (cached) {
        setImageSrcs((previous) => ({ ...previous, [id]: cached }))
        continue
      }

      void ensureImageCached(id, 'original').then((url) => {
        if (!cancelled && url) {
          setImageSrcs((previous) => ({ ...previous, [id]: url }))
        }
      })
    }

    return () => {
      cancelled = true
    }
  }, [task])

  const currentOutputImageId = task?.outputImages?.[imageIndex] || ''
  const currentOutputImageSrc = currentOutputImageId ? imageSrcs[currentOutputImageId] || '' : ''
  const outputLen = task?.outputImages?.length || 0
  const hasGeneratedOutputs = outputLen > 0
  const currentImageRatio = currentOutputImageId ? imageRatios[currentOutputImageId] : ''
  const currentImageSize = currentOutputImageId ? imageSizes[currentOutputImageId] : ''

  useEffect(() => {
    if (!currentOutputImageId || !currentOutputImageSrc) return

    const applyImageMeta = (width: number, height: number) => {
      setImageRatios((previous) => ({
        ...previous,
        [currentOutputImageId]: formatImageRatio(width, height),
      }))
      setImageSizes((previous) => ({
        ...previous,
        [currentOutputImageId]: `${width}×${height}`,
      }))
    }

    const persistedMeta = getCachedImageMetadata(currentOutputImageId)
    if (persistedMeta) {
      applyImageMeta(persistedMeta.width, persistedMeta.height)
      return
    }

    let cancelled = false
    const loadMetaFromImage = () => {
      const image = new Image()

      image.onload = () => {
        if (!cancelled && image.naturalWidth > 0 && image.naturalHeight > 0) {
          applyImageMeta(image.naturalWidth, image.naturalHeight)
        }
      }

      image.src = currentOutputImageSrc
      if (image.complete && image.naturalWidth > 0 && image.naturalHeight > 0) {
        applyImageMeta(image.naturalWidth, image.naturalHeight)
      }
    }

    void ensureCachedImageMetadata(currentOutputImageId)
      .then((metadata) => {
        if (!cancelled && metadata) {
          applyImageMeta(metadata.width, metadata.height)
          return
        }

        if (!cancelled) {
          loadMetaFromImage()
        }
      })
      .catch(() => {
        if (!cancelled) {
          loadMetaFromImage()
        }
      })

    return () => {
      cancelled = true
    }
  }, [currentOutputImageId, currentOutputImageSrc])

  const updateImageLabelLeft = () => {
    const panel = imagePanelRef.current
    const image = mainImageRef.current
    if (!panel || !image) return

    const panelRect = panel.getBoundingClientRect()
    const imageRect = image.getBoundingClientRect()
    setImageLabelLeft(Math.max(8, imageRect.left - panelRect.left))
  }

  useEffect(() => {
    updateImageLabelLeft()
    window.addEventListener('resize', updateImageLabelLeft)
    return () => window.removeEventListener('resize', updateImageLabelLeft)
  }, [currentOutputImageSrc])

  return {
    imageIndex,
    setImageIndex,
    imageSrcs,
    imageLabelLeft,
    imagePanelRef,
    mainImageRef,
    currentOutputImageId,
    currentOutputImageSrc,
    currentImageRatio,
    currentImageSize,
    outputLen,
    hasGeneratedOutputs,
    updateImageLabelLeft,
  }
}
