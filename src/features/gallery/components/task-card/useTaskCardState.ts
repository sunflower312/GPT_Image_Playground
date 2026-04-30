import { useEffect, useRef, useState, type TouchEventHandler } from 'react'
import type { TaskRecord } from '../../../../types'
import {
  ensureCachedImageMetadata,
  ensureImageCached,
  getCachedImage,
  getCachedImageMetadata,
} from '../../../../store/cache'
import { formatImageRatio } from '../../../../lib/size'
import { TOUCH_ACTION_REVEAL_DELAY, imageMetaCache } from './shared'

export function useTaskCardState(task: TaskRecord) {
  const cardRef = useRef<HTMLDivElement | null>(null)
  const touchRevealTimerRef = useRef<number | null>(null)
  const suppressNextClickRef = useRef(false)

  const [thumbSrc, setThumbSrc] = useState('')
  const [coverRatio, setCoverRatio] = useState('')
  const [coverSize, setCoverSize] = useState('')
  const [now, setNow] = useState(Date.now())
  const [touchActionsVisible, setTouchActionsVisible] = useState(false)

  const coverImageId =
    task.status === 'running'
      ? task.outputImages?.[task.outputImages.length - 1] || ''
      : task.outputImages?.[0] || ''

  useEffect(() => {
    if (task.status !== 'running') return

    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [task.status])

  useEffect(() => {
    let cancelled = false
    setCoverRatio('')
    setCoverSize('')
    setThumbSrc('')

    if (!coverImageId) return () => {
      cancelled = true
    }

    const cached = getCachedImage(coverImageId, 'thumbnail')
    if (cached) {
      setThumbSrc(cached)
      return () => {
        cancelled = true
      }
    }

    void ensureImageCached(coverImageId, 'thumbnail').then((url) => {
      if (!cancelled && url) {
        setThumbSrc(url)
      }
    })

    return () => {
      cancelled = true
    }
  }, [coverImageId])

  useEffect(() => {
    if (!thumbSrc || !coverImageId) return

    const applyCoverMeta = (width: number, height: number) => {
      const nextMeta = {
        ratio: formatImageRatio(width, height),
        size: `${width}×${height}`,
      }
      imageMetaCache.set(coverImageId, nextMeta)
      setCoverRatio(nextMeta.ratio)
      setCoverSize(nextMeta.size)
    }

    const cachedMeta = imageMetaCache.get(coverImageId)
    if (cachedMeta) {
      setCoverRatio(cachedMeta.ratio)
      setCoverSize(cachedMeta.size)
      return
    }

    const persistedMeta = getCachedImageMetadata(coverImageId)
    if (persistedMeta) {
      applyCoverMeta(persistedMeta.width, persistedMeta.height)
      return
    }

    let cancelled = false
    const loadMetaFromImage = () => {
      const image = new Image()
      image.onload = () => {
        if (!cancelled && image.naturalWidth > 0 && image.naturalHeight > 0) {
          applyCoverMeta(image.naturalWidth, image.naturalHeight)
        }
      }
      image.src = thumbSrc

      if (image.complete && image.naturalWidth > 0 && image.naturalHeight > 0) {
        applyCoverMeta(image.naturalWidth, image.naturalHeight)
      }
    }

    void ensureCachedImageMetadata(coverImageId)
      .then((metadata) => {
        if (!cancelled && metadata) {
          applyCoverMeta(metadata.width, metadata.height)
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
  }, [coverImageId, thumbSrc])

  useEffect(() => {
    if (!touchActionsVisible) return

    const handleOutsideTouch = (event: TouchEvent) => {
      if (!cardRef.current?.contains(event.target as Node)) {
        setTouchActionsVisible(false)
      }
    }

    document.addEventListener('touchstart', handleOutsideTouch, { passive: true })
    return () => document.removeEventListener('touchstart', handleOutsideTouch)
  }, [touchActionsVisible])

  useEffect(
    () => () => {
      if (touchRevealTimerRef.current != null) {
        window.clearTimeout(touchRevealTimerRef.current)
      }
    },
    [],
  )

  const duration = (() => {
    let seconds: number
    if (task.status === 'running') {
      seconds = Math.floor((now - task.createdAt) / 1000)
    } else if (task.elapsed != null) {
      seconds = Math.floor(task.elapsed / 1000)
    } else {
      return '00:00'
    }

    const mm = String(Math.floor(seconds / 60)).padStart(2, '0')
    const ss = String(seconds % 60).padStart(2, '0')
    return `${mm}:${ss}`
  })()

  const clearTouchRevealTimer = () => {
    if (touchRevealTimerRef.current != null) {
      window.clearTimeout(touchRevealTimerRef.current)
      touchRevealTimerRef.current = null
    }
  }

  const closeTouchActions = () => {
    setTouchActionsVisible(false)
  }

  const consumeCardClick = () => {
    if (suppressNextClickRef.current) {
      suppressNextClickRef.current = false
      return false
    }
    return true
  }

  const handleTouchStart: TouchEventHandler<HTMLDivElement> = (event) => {
    if (event.touches.length !== 1) return

    suppressNextClickRef.current = false
    clearTouchRevealTimer()
    touchRevealTimerRef.current = window.setTimeout(() => {
      suppressNextClickRef.current = true
      setTouchActionsVisible(true)
    }, TOUCH_ACTION_REVEAL_DELAY)
  }

  const handleTouchMove: TouchEventHandler<HTMLDivElement> = () => {
    clearTouchRevealTimer()
  }

  const handleTouchEnd: TouchEventHandler<HTMLDivElement> = () => {
    clearTouchRevealTimer()
  }

  return {
    cardRef,
    thumbSrc,
    coverRatio,
    coverSize,
    duration,
    touchActionsVisible,
    closeTouchActions,
    consumeCardClick,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  }
}
