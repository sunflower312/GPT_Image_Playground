import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ImageEditSelection, ImageEditSession } from '../../../../types'
import { createEmptyDisplayRect, type ImageDisplayRect, type ImageNaturalSize } from './shared'
import { useImageAssetView } from '../../../../hooks/useImageAssetView'

export function useImageEditState(imageEditSession: ImageEditSession | null, activeProviderId: string) {
  const [promptDraft, setPromptDraft] = useState('')
  const [providerDraft, setProviderDraft] = useState('')
  const [selection, setSelection] = useState<ImageEditSelection | null>(null)
  const [naturalSize, setNaturalSize] = useState<ImageNaturalSize | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [currentImageSrc, setCurrentImageSrc] = useState('')
  const [displayRect, setDisplayRect] = useState<ImageDisplayRect>(createEmptyDisplayRect)
  const panelRef = useRef<HTMLDivElement | null>(null)
  const imageRef = useRef<HTMLImageElement | null>(null)

  const availableImageIds = useMemo(() => {
    const mergedIds = [
      imageEditSession?.sourceImageId ?? '',
      ...(imageEditSession?.sourceImageIds ?? []),
    ]
    return Array.from(
      new Set(
        mergedIds.filter((imageId): imageId is string => typeof imageId === 'string' && Boolean(imageId.trim())),
      ),
    )
  }, [imageEditSession])

  const totalImageCount = availableImageIds.length
  const displayImageCount = Math.max(totalImageCount, 1)
  const currentImageNumber = totalImageCount ? currentImageIndex + 1 : 1
  const hasMultipleImages = totalImageCount > 1
  const currentImageId = availableImageIds[currentImageIndex] ?? imageEditSession?.sourceImageId ?? ''
  const { url: loadedImageSrc } = useImageAssetView(currentImageId)
  const displayImageSrc =
    currentImageSrc ||
    (imageEditSession && currentImageId === imageEditSession.sourceImageId
      ? imageEditSession.sourceImageDataUrl
      : '')

  const resetImageViewport = useCallback(() => {
    setNaturalSize(null)
    setDisplayRect(createEmptyDisplayRect())
  }, [])

  useEffect(() => {
    if (!imageEditSession) return

    const initialImageIds = [
      imageEditSession.sourceImageId,
      ...(imageEditSession.sourceImageIds ?? []),
    ].filter((imageId): imageId is string => Boolean(imageId))
    const dedupedImageIds = Array.from(new Set(initialImageIds))
    const preferredIndex = Math.max(0, dedupedImageIds.indexOf(imageEditSession.sourceImageId))

    setPromptDraft(imageEditSession.prompt)
    setProviderDraft(imageEditSession.providerId ?? activeProviderId)
    setSelection(imageEditSession.initialSelection ?? null)
    setIsSubmitting(false)
    setCurrentImageIndex(preferredIndex)
    setCurrentImageSrc(imageEditSession.sourceImageDataUrl)
    resetImageViewport()
  }, [activeProviderId, imageEditSession, resetImageViewport])

  useEffect(() => {
    if (!imageEditSession || !currentImageId) {
      setCurrentImageSrc('')
      resetImageViewport()
      return
    }

    let cancelled = false
    resetImageViewport()
    setSelection(
      currentImageId === imageEditSession.sourceImageId
        ? imageEditSession.initialSelection ?? null
        : null,
    )

    if (currentImageId === imageEditSession.sourceImageId) {
      setCurrentImageSrc(imageEditSession.sourceImageDataUrl)
      return () => {
        cancelled = true
      }
    }

    setCurrentImageSrc(loadedImageSrc)

    return () => {
      cancelled = true
    }
  }, [currentImageId, imageEditSession, loadedImageSrc, resetImageViewport])

  const updateDisplayRect = useCallback(() => {
    const panel = panelRef.current
    const image = imageRef.current
    if (!panel || !image) return

    const panelRect = panel.getBoundingClientRect()
    const imageRect = image.getBoundingClientRect()
    setDisplayRect({
      left: imageRect.left - panelRect.left,
      top: imageRect.top - panelRect.top,
      width: imageRect.width,
      height: imageRect.height,
    })
  }, [])

  useEffect(() => {
    if (!imageEditSession) return

    updateDisplayRect()
    window.addEventListener('resize', updateDisplayRect)
    return () => window.removeEventListener('resize', updateDisplayRect)
  }, [imageEditSession, naturalSize, updateDisplayRect])

  const handleImageLoad = useCallback(() => {
    const image = imageRef.current
    if (!image) return

    setNaturalSize({
      width: image.naturalWidth,
      height: image.naturalHeight,
    })
    updateDisplayRect()
  }, [updateDisplayRect])

  const switchImage = useCallback(
    (direction: -1 | 1) => {
      if (!totalImageCount) return

      setCurrentImageSrc('')
      resetImageViewport()
      setCurrentImageIndex((index) => (index + direction + totalImageCount) % totalImageCount)
    },
    [resetImageViewport, totalImageCount],
  )

  return {
    promptDraft,
    setPromptDraft,
    providerDraft,
    setProviderDraft,
    selection,
    setSelection,
    naturalSize,
    isSubmitting,
    setIsSubmitting,
    displayRect,
    panelRef,
    imageRef,
    availableImageIds,
    displayImageCount,
    currentImageNumber,
    hasMultipleImages,
    currentImageId,
    displayImageSrc,
    handleImageLoad,
    switchImage,
  }
}
