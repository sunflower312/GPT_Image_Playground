import type { TaskRecord } from '../../../../types'
import TaskCardPreviewActionButtons from './TaskCardPreviewActionButtons'
import TaskCardPreviewMetaBadge from './TaskCardPreviewMetaBadge'
import TaskCardPreviewStatusLayer from './TaskCardPreviewStatusLayer'

interface TaskCardPreviewProps {
  task: TaskRecord
  thumbSrc: string
  imageFit?: 'cover' | 'contain'
  coverRatio: string
  coverSize: string
  duration: string
  progressCountLabel: string | null
  statusLabel: string
  isInRecycleBin: boolean
  isFavorite: boolean
  selected: boolean
  touchActionsVisible: boolean
  onAbort: () => void
  onToggleFavorite: () => void
  onToggleSelect: () => void
  onHideTouchActions: () => void
}

export default function TaskCardPreview({
  task,
  thumbSrc,
  imageFit = 'cover',
  coverRatio,
  coverSize,
  duration,
  progressCountLabel,
  statusLabel,
  isInRecycleBin,
  isFavorite,
  selected,
  touchActionsVisible,
  onAbort,
  onToggleFavorite,
  onToggleSelect,
  onHideTouchActions,
}: TaskCardPreviewProps) {
  const isRunning = task.status === 'running'

  return (
    <div
      className={`group/task-preview relative flex h-40 w-40 min-w-[10rem] flex-shrink-0 items-center justify-center overflow-hidden bg-gray-100 dark:bg-black/20 ${isRunning ? 'select-none' : ''}`}
    >
      <TaskCardPreviewActionButtons
        isInRecycleBin={isInRecycleBin}
        isFavorite={isFavorite}
        selected={selected}
        touchActionsVisible={touchActionsVisible}
        onToggleFavorite={onToggleFavorite}
        onToggleSelect={onToggleSelect}
        onHideTouchActions={onHideTouchActions}
      />

      <TaskCardPreviewStatusLayer
        task={task}
        thumbSrc={thumbSrc}
        imageFit={imageFit}
        progressCountLabel={progressCountLabel}
        statusLabel={statusLabel}
        onAbort={onAbort}
      />

      <div className="absolute left-2 top-2 flex items-center gap-1.5">
        <TaskCardPreviewMetaBadge
          task={task}
          coverRatio={coverRatio}
          coverSize={coverSize}
          duration={duration}
        />
      </div>
    </div>
  )
}
