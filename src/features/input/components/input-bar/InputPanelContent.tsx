import ParamsSection from './ParamsSection'
import PromptSection from './PromptSection'
import ReferenceImagesSection from './ReferenceImagesSection'
import SubmitSection from './SubmitSection'
import type { InputBarContentViewModel } from './useInputBarState'

interface InputPanelContentProps {
  content: InputBarContentViewModel
}

export default function InputPanelContent({ content }: InputPanelContentProps) {
  const {
    isMobile,
    panelBindings,
    promptSectionProps,
    referenceImagesSectionProps,
    paramsSectionProps,
    submitSectionProps,
  } =
    content

  return (
    <div
      data-input-panel
      {...panelBindings}
      className={`flex flex-1 flex-col gap-4 overflow-y-auto overscroll-contain ${
        isMobile
          ? 'custom-scrollbar px-4 pb-[calc(env(safe-area-inset-bottom,0px)+1.75rem)] pl-4 pr-3 pt-4'
          : 'p-4 pb-5'
      }`}
    >
      <PromptSection {...promptSectionProps} />
      <ReferenceImagesSection {...referenceImagesSectionProps} />

      {isMobile ? (
        <ParamsSection {...paramsSectionProps} />
      ) : (
        <>
          <div className="my-2 h-px bg-gray-200 dark:bg-white/[0.08]" />
          <ParamsSection {...paramsSectionProps} />
        </>
      )}

      <SubmitSection {...submitSectionProps} />
    </div>
  )
}
