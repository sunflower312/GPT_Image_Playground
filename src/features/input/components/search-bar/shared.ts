export type CategoryEditorMode = 'idle' | 'create' | 'rename'
export type SearchFilterStatus = 'all' | 'running' | 'done' | 'error' | 'partial_error'

export interface CategoryChipItem {
  label: string
  value: string
  count: number
}

export const CATEGORY_LOOP_COPIES = 3
export const CATEGORY_LOOP_MIN_SCROLL_RATIO = 0.5
export const CATEGORY_LOOP_MAX_SCROLL_RATIO = 1.5

export const SEGMENTED_BUTTON_CLASS =
  'inline-flex h-8 flex-shrink-0 items-center gap-1 whitespace-nowrap rounded-full px-2.5 text-[11px] font-medium transition-all duration-200'

export const ACTION_BUTTON_CLASS =
  'inline-flex h-8 flex-shrink-0 items-center gap-1 whitespace-nowrap rounded-full border px-2.5 text-[11px] font-medium transition-all duration-200'

export const FILTER_STATUS_OPTIONS: Array<{ label: string; value: SearchFilterStatus }> = [
  { label: '全部状态', value: 'all' },
  { label: '已完成', value: 'done' },
  { label: '生成中', value: 'running' },
  { label: '异常', value: 'partial_error' },
  { label: '失败', value: 'error' },
]

export function resolveFilterStatusLabel(status: SearchFilterStatus): string {
  switch (status) {
    case 'done':
      return '已完成'
    case 'running':
      return '生成中'
    case 'partial_error':
      return '异常'
    case 'error':
      return '失败'
    default:
      return '全部状态'
  }
}
