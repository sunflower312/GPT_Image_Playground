import type { RefObject, UIEventHandler } from 'react'
import { CATEGORY_LOOP_COPIES, type CategoryChipItem } from './shared'

interface CategoryTrackProps {
  isMobile: boolean
  activeCategoryFilter: string
  categoryChipItems: CategoryChipItem[]
  categoryViewportRef: RefObject<HTMLDivElement | null>
  categorySegmentRef: RefObject<HTMLDivElement | null>
  categoryLoopEnabled: boolean
  onScroll: UIEventHandler<HTMLDivElement>
  onSelectCategory: (value: string) => void
}

export default function CategoryTrack({
  isMobile,
  activeCategoryFilter,
  categoryChipItems,
  categoryViewportRef,
  categorySegmentRef,
  categoryLoopEnabled,
  onScroll,
  onSelectCategory,
}: CategoryTrackProps) {
  const renderCategoryChip = (label: string, value: string, count: number) => {
    const isActive = activeCategoryFilter === value

    return (
      <button
        type="button"
        onClick={() => onSelectCategory(value)}
        className={`inline-flex h-8 flex-shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3 text-[12px] font-medium transition-all duration-200 ${
          isActive
            ? 'border-blue-500 bg-blue-500 text-white shadow-[0_10px_22px_-16px_rgba(37,99,235,0.8)]'
            : 'border-gray-200/90 bg-white text-gray-600 hover:-translate-y-px hover:border-gray-300 hover:bg-gray-50 dark:border-white/[0.08] dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-white/[0.06]'
        }`}
      >
        <span>{label}</span>
        <span
          className={`rounded-full px-1.5 py-0.5 text-[11px] leading-none ${
            isActive
              ? 'bg-white/[0.16] text-white/90'
              : 'bg-gray-100 text-gray-400 dark:bg-white/[0.05] dark:text-gray-500'
          }`}
        >
          {count}
        </span>
      </button>
    )
  }

  const renderCategoryChipSegment = (copyIndex: number) => (
    <div
      key={`category-segment-${copyIndex}`}
      ref={copyIndex === 0 ? categorySegmentRef : undefined}
      className={`flex flex-shrink-0 ${isMobile ? 'gap-1.5' : 'gap-2'}`}
    >
      {categoryChipItems.map((item) => (
        <div key={`${item.value}-${copyIndex}`} className={isMobile ? 'flex-shrink-0 snap-start' : 'flex-shrink-0'}>
          {renderCategoryChip(item.label, item.value, item.count)}
        </div>
      ))}
    </div>
  )

  return (
    <div className={isMobile ? '-mx-1 overflow-hidden px-1' : 'overflow-hidden'}>
      <div
        ref={categoryViewportRef}
        className={`category-wheel-track hide-scrollbar flex overflow-x-auto pb-0.5 ${
          isMobile
            ? 'snap-x snap-proximity gap-1.5 overscroll-x-contain pr-1'
            : 'mask-edge-r gap-2'
        }`}
        onScroll={isMobile ? undefined : onScroll}
      >
        {Array.from({ length: !isMobile && categoryLoopEnabled ? CATEGORY_LOOP_COPIES : 1 }, (_, index) =>
          renderCategoryChipSegment(index),
        )}
      </div>
    </div>
  )
}
