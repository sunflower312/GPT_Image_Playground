import type { AppSettings } from '../../../../types'
import type { Dispatch, SetStateAction } from 'react'
import { fieldClassName } from './apiSettingsShared'

interface ApiModelSettingsProps {
  draft: AppSettings
  setDraft: Dispatch<SetStateAction<AppSettings>>
  commitSettings: (nextDraft: AppSettings) => void
}

export default function ApiModelSettings({
  draft,
  setDraft,
  commitSettings,
}: ApiModelSettingsProps) {
  return (
    <>
      <label className="block">
        <span className="mb-1 block text-xs text-gray-500 dark:text-gray-400">模型 ID</span>
        <input
          value={draft.model}
          onChange={(event) => setDraft((prev) => ({ ...prev, model: event.target.value }))}
          onBlur={(event) => commitSettings({ ...draft, model: event.target.value })}
          type="text"
          placeholder="gpt-image-2"
          className={fieldClassName}
        />
        <div className="mt-1 text-[10px] text-gray-400 dark:text-gray-500">
          Images API 下这里是直接调用的图片模型；Responses API 下这里是顶层主模型，应该填可用的文本模型，例如 <code className="rounded bg-gray-100 px-1 py-0.5 dark:bg-white/[0.06]">gpt-5.5</code>，不要填 <code className="rounded bg-gray-100 px-1 py-0.5 dark:bg-white/[0.06]">gpt-image-*</code>。
        </div>
      </label>

      <label className="block">
        <span className="mb-1 block text-xs text-gray-500 dark:text-gray-400">Responses 图像模型</span>
        <input
          value={draft.responsesImageModel}
          onChange={(event) => setDraft((prev) => ({ ...prev, responsesImageModel: event.target.value }))}
          onBlur={(event) => commitSettings({ ...draft, responsesImageModel: event.target.value })}
          type="text"
          placeholder="gpt-image-2"
          className={fieldClassName}
        />
        <div className="mt-1 text-[10px] text-gray-400 dark:text-gray-500">
          仅 Responses API 生效，会作为 <code className="rounded bg-gray-100 px-1 py-0.5 dark:bg-white/[0.06]">tools[].model</code> 传入，通常填 <code className="rounded bg-gray-100 px-1 py-0.5 dark:bg-white/[0.06]">gpt-image-2</code>。
        </div>
      </label>

      {draft.providerType === 'azure-foundry' ? (
        <>
          <label className="block">
            <span className="mb-1 block text-xs text-gray-500 dark:text-gray-400">Azure 图片部署（可选）</span>
            <input
              value={draft.azureImageDeployment}
              onChange={(event) => setDraft((prev) => ({ ...prev, azureImageDeployment: event.target.value }))}
              onBlur={(event) => commitSettings({ ...draft, azureImageDeployment: event.target.value })}
              type="text"
              placeholder="gpt-image-2"
              className={fieldClassName}
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs text-gray-500 dark:text-gray-400">Azure Responses 文本部署（可选）</span>
            <input
              value={draft.azureTextDeployment}
              onChange={(event) => setDraft((prev) => ({ ...prev, azureTextDeployment: event.target.value }))}
              onBlur={(event) => commitSettings({ ...draft, azureTextDeployment: event.target.value })}
              type="text"
              placeholder="gpt-5.5-mini"
              className={fieldClassName}
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs text-gray-500 dark:text-gray-400">Azure 图片 API 版本</span>
            <input
              value={draft.azureApiVersion}
              onChange={(event) => setDraft((prev) => ({ ...prev, azureApiVersion: event.target.value }))}
              onBlur={(event) => commitSettings({ ...draft, azureApiVersion: event.target.value })}
              type="text"
              placeholder="2025-04-01-preview"
              className={fieldClassName}
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs text-gray-500 dark:text-gray-400">Azure Responses API 版本</span>
            <input
              value={draft.azureResponsesApiVersion}
              onChange={(event) => setDraft((prev) => ({ ...prev, azureResponsesApiVersion: event.target.value }))}
              onBlur={(event) => commitSettings({ ...draft, azureResponsesApiVersion: event.target.value })}
              type="text"
              placeholder="preview"
              className={fieldClassName}
            />
          </label>
        </>
      ) : null}
    </>
  )
}
