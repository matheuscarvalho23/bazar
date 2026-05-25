import axios from 'axios'
import type { IApiErrorResponse } from '~/interfaces/http/api-error-response.interface'

const DEFAULT_API_ERROR_MESSAGE = 'Nao foi possivel concluir a acao.'

/**
 * Return a readable message from an API error response.
 *
 * @param responseData - API error response payload : IApiErrorResponse | undefined
 *
 * @returns API error message or null : string | null
 */
function getMessageFromApiErrorResponse(
  responseData: IApiErrorResponse | undefined,
): string | null {
  if (!responseData) {
    return null
  }

  if (Array.isArray(responseData.message) && responseData.message.length > 0) {
    return responseData.message.join(' ')
  }

  if (typeof responseData.message === 'string' && responseData.message.trim().length > 0) {
    return responseData.message
  }

  if (typeof responseData.error === 'string' && responseData.error.trim().length > 0) {
    return responseData.error
  }

  return null
}

/**
 * Return a readable user-facing message from an unknown API failure.
 *
 * @param error - Unknown thrown value : unknown
 * @param fallbackMessage - Fallback message : string
 *
 * @returns Error message : string
 */
export function getApiErrorMessage(
  error: unknown,
  fallbackMessage = DEFAULT_API_ERROR_MESSAGE,
): string {
  if (axios.isAxiosError<IApiErrorResponse>(error)) {
    if (error.response?.status === 401) {
      return fallbackMessage
    }

    return getMessageFromApiErrorResponse(error.response?.data) ?? fallbackMessage
  }

  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message
  }

  return fallbackMessage
}
