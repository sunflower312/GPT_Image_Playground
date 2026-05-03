import type {
  ApiProtocol,
  AppSettings,
  ProviderType,
  ResponsesImageInputMode,
  ResponsesReasoningEffort,
  ResponsesPromptRevisionMode,
  ResponsesTransportMode,
} from '../../types'
import type { SharedRequestContext } from './types'
import { buildApiUrl } from '../devProxy'
import { IMAGE_MIME_BY_EXTENSION } from '../imageMime'

const RESPONSES_PROMPT_REVISION_COMPAT_PREFIX = [
  '兼容模式要求：不要改写、重排、总结、翻译、润色或省略下面的“原始提示词”内容。',
  '请保留原始提示词中的段落结构、列表、标签、代码块、正向/负向要求、参数描述与措辞重点，并尽量按原文语义直接执行。',
  '原始提示词如下：',
].join('\n')

export const MIME_MAP = IMAGE_MIME_BY_EXTENSION

export function getApiProtocol(settings: AppSettings): ApiProtocol {
  return settings.apiProtocol === 'responses' ? 'responses' : 'images'
}

export function getProviderType(settings: AppSettings): ProviderType {
  return settings.providerType === 'azure-foundry' ? 'azure-foundry' : 'openai-compatible'
}

export function getResponsesReasoningEffort(settings: AppSettings): ResponsesReasoningEffort {
  return settings.responsesReasoningEffort || 'none'
}

export function getAzureImageDeployment(settings: AppSettings): string {
  return settings.azureImageDeployment?.trim() || settings.model
}

export function getAzureTextDeployment(settings: AppSettings): string {
  return settings.azureTextDeployment?.trim() || settings.model
}

export function getAzureApiVersion(settings: AppSettings): string {
  return settings.azureApiVersion?.trim() || '2025-04-01-preview'
}

export function getAzureResponsesApiVersion(settings: AppSettings): string {
  return settings.azureResponsesApiVersion?.trim() || 'preview'
}

export function getResponsesImageModel(settings: AppSettings): string {
  return settings.responsesImageModel?.trim() || 'gpt-image-2'
}

export function getResponsesTransportMode(settings: AppSettings): ResponsesTransportMode {
  return settings.responsesTransport || 'auto'
}

export function getResponsesImageInputMode(settings: AppSettings): ResponsesImageInputMode {
  return settings.responsesImageInputMode || 'auto'
}

export function getResponsesPromptRevisionMode(settings: AppSettings): ResponsesPromptRevisionMode {
  return settings.responsesPromptRevisionMode === 'compat' ? 'compat' : 'allow'
}

export function buildResponsesPrompt(prompt: string, settings: AppSettings): string {
  if (getResponsesPromptRevisionMode(settings) !== 'compat') {
    return prompt
  }

  const trimmedPrompt = prompt.trim()
  if (!trimmedPrompt) {
    return prompt
  }

  return `${RESPONSES_PROMPT_REVISION_COMPAT_PREFIX}\n\n${prompt}`
}

export function buildRequestUrl(baseUrl: string, path: string, ctx: SharedRequestContext): string {
  return buildApiUrl(baseUrl, path, ctx.proxyConfig, { forceProxy: ctx.forceProxy })
}
