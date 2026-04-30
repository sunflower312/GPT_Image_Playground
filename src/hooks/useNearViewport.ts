import { useEffect, useState, type RefObject } from 'react'

interface UseNearViewportOptions {
  rootMargin?: string
  disabled?: boolean
}

export function useNearViewport<TElement extends Element>(
  targetRef: RefObject<TElement | null>,
  options: UseNearViewportOptions = {},
) {
  const { rootMargin = '0px', disabled = false } = options
  const [isNearViewport, setIsNearViewport] = useState(disabled)

  useEffect(() => {
    if (disabled) {
      setIsNearViewport(true)
      return
    }

    const target = targetRef.current
    if (!target) {
      return
    }

    if (typeof IntersectionObserver !== 'function') {
      setIsNearViewport(true)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (!entry) {
          return
        }

        if (entry.isIntersecting) {
          setIsNearViewport(true)
          observer.disconnect()
        }
      },
      {
        root: null,
        rootMargin,
        threshold: 0.01,
      },
    )

    observer.observe(target)
    return () => observer.disconnect()
  }, [disabled, rootMargin, targetRef])

  return isNearViewport
}
