import type {
  AppliedTransportMeta,
  AppSettings,
  TaskErrorDebugInfo,
  TaskParams,
  TaskResponseMeta,
} from '../../types'
import type { readClientDevProxyConfig } from '../devProxy'

export interface CallApiOptions {
  settings: AppSettings
  prompt: string
  params: TaskParams
  inputImageDataUrls: string[]
  editMaskDataUrl?: string
  editSourceImageIndex?: number
  onFinalImages?: (images: string[]) => void | Promise<void>
  registerAbort?: (abort: () => void) => void
}

export interface CallApiResult {
  images: string[]
  responseMeta?: TaskResponseMeta
}

export type ApiError = Error & {
  status?: number
  requestId?: string
  details?: unknown
}

export type ApiDebugRequestLogEntry = NonNullable<TaskErrorDebugInfo['requestLog']>[number]
export type ApiDebugRequestSnapshot = NonNullable<TaskErrorDebugInfo['request']>
export type ActualTransportKind = NonNullable<AppliedTransportMeta['actual']>

export interface SharedRequestContext {
  controller: AbortController
  requestHeaders: Record<string, string>
  proxyConfig: ReturnType<typeof readClientDevProxyConfig>
  mime: string
  forceProxy: boolean
  debugLog: ApiDebugRequestLogEntry[]
}

export interface ResponsesInputImage {
  type: 'input_image'
  image_url?: string
  file_id?: string
}

export interface ResponsesInputImageMask {
  image_url?: string
  file_id?: string
}

export type ResponsesInputContent =
  | {
      type: 'input_text'
      text: string
    }
  | ResponsesInputImage

export type ResponsesInputPayloadMode = 'compact-string' | 'message-list'
export type ResponsesTransportKind = 'json' | 'stream'
export type ResponsesActionMode = 'auto' | 'explicit'
export type ResponsesToolChoiceMode = 'omit' | 'force'

export interface ResponsesRequestPlan {
  id: string
  inputPayloadMode: ResponsesInputPayloadMode
  transport: ResponsesTransportKind
  actionMode: ResponsesActionMode
  toolChoiceMode: ResponsesToolChoiceMode
}

export interface ImagesRequestPlan {
  id: string
  transport: ResponsesTransportKind
}

export interface ParsedSseEvent {
  event: string
  dataText: string
  json?: unknown
}

export interface StreamedPayloadResult {
  payload: unknown
  streamedFinalImageCount: number
  actualTransport: ActualTransportKind
}
