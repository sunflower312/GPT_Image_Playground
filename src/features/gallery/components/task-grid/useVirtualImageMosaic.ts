import { useLayoutEffect, useMemo, useState, type RefObject } from 'react'
import type {
  ImageMosaicDecorativeItem,
  ImageMosaicTaskItem,
} from './useImageMosaicLayout'

const IMAGE_MOSAIC_OVERSCAN_ROWS = 36

interface ImageMosaicViewportMetrics {
  scrollTop: number
  viewportHeight: number
  gridTop: number
}

interface UseVirtualImageMosaicOptions {
  wrapperRef: RefObject<HTMLDivElement | null>
  gridRef: RefObject<HTMLDivElement | null>
  rowUnit: number
  gap: number
  totalRowCount: number
  taskItems: ImageMosaicTaskItem[]
  decorativeItems: ImageMosaicDecorativeItem[]
  layoutVersion: number
}

type ScrollContainer = Window | HTMLElement

function isWindowScrollContainer(container: ScrollContainer): container is Window {
  return container === window
}

function isScrollableOverflow(value: string): boolean {
  return /(auto|scroll|overlay)/.test(value)
}

function resolveScrollContainer(element: HTMLElement | null): ScrollContainer {
  let current = element?.parentElement ?? null

  while (current) {
    const style = window.getComputedStyle(current)
    if (isScrollableOverflow(style.overflowY) || isScrollableOverflow(style.overflow)) {
      return current
    }
    current = current.parentElement
  }

  return window
}

function readScrollTop(container: ScrollContainer): number {
  return isWindowScrollContainer(container) ? window.scrollY : container.scrollTop
}

function readViewportHeight(container: ScrollContainer): number {
  return isWindowScrollContainer(container) ? window.innerHeight : container.clientHeight
}

function readGridTop(grid: HTMLDivElement | null, container: ScrollContainer): number {
  const rect = grid?.getBoundingClientRect()
  if (!rect) {
    return 0
  }

  if (isWindowScrollContainer(container)) {
    return rect.top + window.scrollY
  }

  const containerRect = container.getBoundingClientRect()
  return rect.top - containerRect.top + container.scrollTop
}

function readViewportMetrics(
  grid: HTMLDivElement | null,
  container: ScrollContainer,
): ImageMosaicViewportMetrics {
  return {
    scrollTop: readScrollTop(container),
    viewportHeight: readViewportHeight(container),
    gridTop: readGridTop(grid, container),
  }
}

function intersectsRowRange(
  rowStart: number,
  rowSpan: number,
  visibleStartRow: number,
  visibleEndRow: number,
) {
  const itemStart = rowStart
  const itemEnd = rowStart + rowSpan - 1
  return itemStart <= visibleEndRow && itemEnd >= visibleStartRow
}

export function useVirtualImageMosaic({
  wrapperRef,
  gridRef,
  rowUnit,
  gap,
  totalRowCount,
  taskItems,
  decorativeItems,
  layoutVersion,
}: UseVirtualImageMosaicOptions) {
  const [metrics, setMetrics] = useState<ImageMosaicViewportMetrics>(() =>
    readViewportMetrics(null, window),
  )

  useLayoutEffect(() => {
    let frameId = 0
    const scrollContainer = resolveScrollContainer(wrapperRef.current)

    const updateMetrics = () => {
      frameId = 0
      setMetrics(readViewportMetrics(gridRef.current, scrollContainer))
    }

    const requestMetricsUpdate = () => {
      if (frameId !== 0) {
        return
      }

      frameId = window.requestAnimationFrame(updateMetrics)
    }

    updateMetrics()
    scrollContainer.addEventListener('scroll', requestMetricsUpdate, { passive: true })
    window.addEventListener('resize', requestMetricsUpdate)

    const resizeObserver =
      typeof ResizeObserver === 'function'
        ? new ResizeObserver(() => {
            updateMetrics()
          })
        : null

    if (resizeObserver) {
      if (!isWindowScrollContainer(scrollContainer)) {
        resizeObserver.observe(scrollContainer)
      }
      if (wrapperRef.current) {
        resizeObserver.observe(wrapperRef.current)
      }
      if (gridRef.current) {
        resizeObserver.observe(gridRef.current)
      }
    }

    return () => {
      if (frameId !== 0) {
        window.cancelAnimationFrame(frameId)
      }
      scrollContainer.removeEventListener('scroll', requestMetricsUpdate)
      window.removeEventListener('resize', requestMetricsUpdate)
      resizeObserver?.disconnect()
    }
  }, [gridRef, layoutVersion, totalRowCount, wrapperRef])

  return useMemo(() => {
    const rowStride = rowUnit + gap
    const relativeViewportTop = Math.max(0, metrics.scrollTop - metrics.gridTop)
    const relativeViewportBottom = Math.max(
      0,
      metrics.scrollTop + metrics.viewportHeight - metrics.gridTop,
    )
    const viewportStartRow = Math.floor(relativeViewportTop / Math.max(rowStride, 1)) + 1
    const viewportEndRow = Math.ceil(relativeViewportBottom / Math.max(rowStride, 1)) + 1
    const visibleStartRow = Math.max(1, viewportStartRow - IMAGE_MOSAIC_OVERSCAN_ROWS)
    const visibleEndRow = Math.min(
      Math.max(totalRowCount, 1),
      viewportEndRow + IMAGE_MOSAIC_OVERSCAN_ROWS,
    )

    return {
      visibleStartRow,
      visibleEndRow,
      renderedTaskItems: taskItems.filter((item) =>
        intersectsRowRange(item.rowStart, item.rowSpan, visibleStartRow, visibleEndRow),
      ),
      renderedDecorativeItems: decorativeItems.filter((item) =>
        intersectsRowRange(item.rowStart, item.rowSpan, visibleStartRow, visibleEndRow),
      ),
    }
  }, [decorativeItems, gap, metrics, rowUnit, taskItems, totalRowCount])
}
