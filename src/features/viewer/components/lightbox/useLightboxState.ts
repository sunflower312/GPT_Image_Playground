import { useCallback, useEffect, useState } from 'react'
import { useStore } from '../../../../store'
import { ensureImageCached, getCachedImage } from '../../../../store/cache'

export function useLightboxState() {
  const lightboxImageId = useStore((state) => state.lightboxImageId)
  const lightboxImageList = useStore((state) => state.lightboxImageList)
  const setLightboxImageId = useStore((state) => state.setLightboxImageId)
  const [src, setSrc] = useState('')

  const close = useCallback(() => {
    setLightboxImageId(null)
  }, [setLightboxImageId])

  useEffect(() => {
    if (!lightboxImageId) {
      setSrc('')
      return
    }

    let cancelled = false
    const cached = getCachedImage(lightboxImageId, 'original')
    if (cached) {
      setSrc(cached)
      return () => {
        cancelled = true
      }
    }

    setSrc('')
    void ensureImageCached(lightboxImageId, 'original')
      .then((url) => {
        if (!cancelled && url) {
          setSrc(url)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSrc('')
        }
      })

    return () => {
      cancelled = true
    }
  }, [lightboxImageId])

  const currentIndex = lightboxImageId ? lightboxImageList.indexOf(lightboxImageId) : -1
  const total = lightboxImageList.length
  const showNav = total > 1

  const goTo = useCallback(
    (index: number) => {
      if (lightboxImageList.length === 0) return

      const wrappedIndex =
        ((index % lightboxImageList.length) + lightboxImageList.length) % lightboxImageList.length
      setLightboxImageId(lightboxImageList[wrappedIndex], lightboxImageList)
    },
    [lightboxImageList, setLightboxImageId],
  )

  const goPrev = useCallback(() => {
    if (!showNav) return
    goTo(currentIndex - 1)
  }, [currentIndex, goTo, showNav])

  const goNext = useCallback(() => {
    if (!showNav) return
    goTo(currentIndex + 1)
  }, [currentIndex, goTo, showNav])

  useEffect(() => {
    if (!lightboxImageId || !showNav) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        goPrev()
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault()
        goNext()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [goNext, goPrev, lightboxImageId, showNav])

  return {
    lightboxImageId,
    src,
    close,
    showNav,
    currentIndex,
    total,
    goPrev,
    goNext,
  }
}
