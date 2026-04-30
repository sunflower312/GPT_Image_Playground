import { useEffect } from 'react'
import { useStore, reuseConfig, editOutputs, retryTask, toggleTaskFavorite } from '../../../../store'
import SelectionToolbar from './SelectionToolbar'
import TaskGridBody from './TaskGridBody'
import TaskGridOverlays from './TaskGridOverlays'
import { useBoxSelection } from './useBoxSelection'
import { useTaskGridActions } from './useTaskGridActions'
import { useTaskGridDerivedState } from './useTaskGridDerivedState'
import { useTaskGridUiState } from './useTaskGridUiState'
import { useVirtualTaskGrid } from './useVirtualTaskGrid'

export default function TaskGrid() {
  const tasks = useStore((state) => state.tasks)
  const categories = useStore((state) => state.categories)
  const providers = useStore((state) => state.providers)
  const activeCategoryFilter = useStore((state) => state.activeCategoryFilter)
  const searchQuery = useStore((state) => state.searchQuery)
  const filterStatus = useStore((state) => state.filterStatus)
  const taskView = useStore((state) => state.taskView)
  const selectedTaskIds = useStore((state) => state.selectedTaskIds)
  const setSelectedTaskIds = useStore((state) => state.setSelectedTaskIds)
  const toggleTaskSelection = useStore((state) => state.toggleTaskSelection)
  const clearSelectedTasks = useStore((state) => state.clearSelectedTasks)
  const setDetailTaskId = useStore((state) => state.setDetailTaskId)
  const setConfirmDialog = useStore((state) => state.setConfirmDialog)
  const showToast = useStore((state) => state.showToast)

  const uiState = useTaskGridUiState({
    categories,
    activeCategoryFilter,
  })

  const {
    categoryIdSet,
    filteredTasks,
    selectedIdSet,
    visibleTaskIds,
    visibleTaskIdSet,
    selectedTasks,
    visibleSelectedCount,
    selectedCount,
    allSelectedFavorited,
    hasVisibleTasks,
    allVisibleSelected,
    categoryOptions,
    activeCategoryLabel,
  } = useTaskGridDerivedState({
    tasks,
    categories,
    providers,
    activeCategoryFilter,
    searchQuery,
    filterStatus,
    taskView,
    selectedTaskIds,
  })

  const virtualGrid = useVirtualTaskGrid({
    wrapperRef: uiState.wrapperRef,
    gridRef: uiState.gridRef,
    tasks: filteredTasks,
    layoutVersion: selectedCount,
  })

  const {
    selectionBox,
    handleGridMouseDownCapture,
    shouldSuppressTaskOpen,
  } = useBoxSelection({
    gridRef: uiState.gridRef,
    filteredTaskCount: filteredTasks.length,
    selectedTaskIds,
    clearSelectedTasks,
    setSelectedTaskIds,
    onStartSelection: () => uiState.setContextMenuState(null),
  })

  const {
    handleDelete,
    handleRestore,
    handlePurge,
    handleAbort,
    handleToggleAllVisible,
    handleBatchDelete,
    handleBatchRestore,
    handleBatchPurge,
    handleBatchMoveCategory,
    openMoveCategoryModal,
    handleSingleTaskMoveCategory,
    handleBatchFavorite,
    handleTaskContextMenu,
    handleTaskOpen,
  } = useTaskGridActions({
    selectedTaskIds,
    visibleTaskIds,
    visibleTaskIdSet,
    selectedTasks,
    allSelectedFavorited,
    hasVisibleTasks,
    allVisibleSelected,
    batchCategoryTarget: uiState.batchCategoryTarget,
    movingTask: uiState.movingTask,
    moveCategoryTarget: uiState.moveCategoryTarget,
    setSelectedTaskIds,
    setMovingTask: uiState.setMovingTask,
    setMoveCategoryTarget: uiState.setMoveCategoryTarget,
    setContextMenuState: uiState.setContextMenuState,
    setDetailTaskId,
    setConfirmDialog,
    showToast,
    shouldSuppressTaskOpen,
    categoryIdSet,
  })

  useEffect(() => {
    if (!uiState.contextMenuState) return
    if (filteredTasks.some((task) => task.id === uiState.contextMenuState?.task.id)) return
    uiState.setContextMenuState(null)
  }, [filteredTasks, uiState.contextMenuState, uiState.setContextMenuState])

  const shouldShowSelectionToolbar = taskView === 'trash' || selectedCount > 0

  return (
    <div ref={uiState.wrapperRef} className="space-y-3">
      {shouldShowSelectionToolbar && (
        <SelectionToolbar
          taskView={taskView}
          selectedCount={selectedCount}
          visibleSelectedCount={visibleSelectedCount}
          allSelectedFavorited={allSelectedFavorited}
          batchCategoryTarget={uiState.batchCategoryTarget}
          categoryOptions={categoryOptions}
          hasVisibleTasks={hasVisibleTasks}
          allVisibleSelected={allVisibleSelected}
          onBatchCategoryTargetChange={uiState.setBatchCategoryTarget}
          onBatchFavorite={() => {
            void handleBatchFavorite()
          }}
          onBatchMoveCategory={() => {
            void handleBatchMoveCategory()
          }}
          onToggleAllVisible={handleToggleAllVisible}
          onClearSelected={clearSelectedTasks}
          onBatchRestore={handleBatchRestore}
          onBatchPurge={handleBatchPurge}
          onBatchDelete={handleBatchDelete}
        />
      )}

      <TaskGridBody
        filteredTaskCount={filteredTasks.length}
        renderedTasks={virtualGrid.renderedTasks}
        renderedTaskRangeLabel={
          virtualGrid.renderedTasks.length > 0
            ? `${virtualGrid.startIndex + 1}-${virtualGrid.endIndex}`
            : '0'
        }
        topSpacerHeight={virtualGrid.topSpacerHeight}
        bottomSpacerHeight={virtualGrid.bottomSpacerHeight}
        categories={categories}
        providers={providers}
        selectedIdSet={selectedIdSet}
        activeCategoryFilter={activeCategoryFilter}
        activeCategoryLabel={activeCategoryLabel}
        searchQuery={searchQuery}
        taskView={taskView}
        gridRef={uiState.gridRef}
        onGridMouseDownCapture={handleGridMouseDownCapture}
        onTaskOpen={handleTaskOpen}
        onToggleTaskSelection={toggleTaskSelection}
        onTaskReuse={(task) => {
          void reuseConfig(task)
        }}
        onTaskEditOutputs={(task) => {
          void editOutputs(task)
        }}
        onTaskRetry={(task) => {
          void retryTask(task)
        }}
        onTaskAbort={handleAbort}
        onTaskToggleFavorite={(task) => {
          void toggleTaskFavorite(task)
        }}
        onTaskMoveCategory={openMoveCategoryModal}
        onTaskDelete={handleDelete}
        onTaskPurge={handlePurge}
        onTaskRestore={handleRestore}
        onTaskContextMenu={handleTaskContextMenu}
      />

      <TaskGridOverlays
        movingTask={uiState.movingTask}
        categories={categories}
        moveCategoryTarget={uiState.moveCategoryTarget}
        selectionBox={selectionBox}
        contextMenuState={uiState.contextMenuState}
        taskView={taskView}
        onMoveCategoryTargetChange={uiState.setMoveCategoryTarget}
        onCloseMoveCategory={() => uiState.setMovingTask(null)}
        onConfirmMoveCategory={() => {
          void handleSingleTaskMoveCategory()
        }}
        onCloseContextMenu={() => uiState.setContextMenuState(null)}
        onOpenTask={handleTaskOpen}
        onMoveTaskCategory={openMoveCategoryModal}
        onDeleteTask={handleDelete}
        onPurgeTask={handlePurge}
        onRestoreTask={handleRestore}
      />
    </div>
  )
}
