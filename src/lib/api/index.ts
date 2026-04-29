import { normalizeProxyTargetBaseUrl, readClientDevProxyConfig } from '../devProxy'
import { callImagesApi } from './images'
import { callResponsesApi } from './responses'
import { attachLocalDebugToError, createApiError, getApiProtocol, MIME_MAP, normalizeEditMaskForProvider } from './helpers'
import type { ApiDebugRequestLogEntry, CallApiOptions, CallApiResult, SharedRequestContext } from './types'

export { normalizeBaseUrl } from '../devProxy'
export type { CallApiOptions, CallApiResult } from './types'

export async function callImageApi(opts: CallApiOptions): Promise<CallApiResult> {
  const { settings, params } = opts
  const mime = MIME_MAP[params.output_format] || 'image/png'
  const proxyConfig = readClientDevProxyConfig()
  const forceProxy = settings.requestMode === 'local_proxy'
  const debugLog: ApiDebugRequestLogEntry[] = []

  const requestHeaders: Record<string, string> = {
    Authorization: `Bearer ${settings.apiKey}`,
    'Cache-Control': 'no-store, no-cache, max-age=0',
    Pragma: 'no-cache',
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), settings.timeout * 1000)
  opts.registerAbort?.(() => controller.abort())
  let normalizedOpts = opts

  try {
    if (forceProxy && !proxyConfig?.enabled) {
      throw createApiError(
        '本地代理模式已启用，但未检测到可用的开发代理。请确认 dev-proxy.config.json 存在，并重启 npm run dev。',
      )
    }

    if (forceProxy) {
      const proxyTargetBaseUrl = normalizeProxyTargetBaseUrl(settings.baseUrl)
      if (!proxyTargetBaseUrl) {
        throw createApiError('API URL 无效，请检查设置中的 API URL')
      }
      requestHeaders['X-Dev-Proxy-Target'] = proxyTargetBaseUrl
    }

    normalizedOpts =
      opts.editMaskDataUrl != null
        ? {
            ...opts,
            editMaskDataUrl: await normalizeEditMaskForProvider(opts.editMaskDataUrl),
          }
        : opts

    const ctx: SharedRequestContext = {
      controller,
      requestHeaders,
      proxyConfig,
      mime,
      forceProxy,
      debugLog,
    }
    const apiProtocol = getApiProtocol(settings)

    if (apiProtocol === 'responses') {
      return await callResponsesApi(normalizedOpts, ctx)
    }

    if (apiProtocol === 'images') {
      return await callImagesApi(normalizedOpts, ctx)
    }

    return await callImagesApi(normalizedOpts, ctx)
  } catch (error) {
    throw attachLocalDebugToError(error, normalizedOpts, debugLog)
  } finally {
    clearTimeout(timeoutId)
  }
}
