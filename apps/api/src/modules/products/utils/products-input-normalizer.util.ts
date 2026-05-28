import { BadRequestException } from '@nestjs/common'

/**
 * Normalize a required string value.
 *
 * @param value - Raw string value : string
 * @param errorMessage - Validation error message : string
 *
 * @returns Normalized non-empty string : string
 */
export function normalizeRequiredString(value: string, errorMessage: string): string {
  const normalizedValue = value.trim().replace(/\s+/g, ' ')

  if (normalizedValue.length === 0) {
    throw new BadRequestException(errorMessage)
  }

  return normalizedValue
}

/**
 * Normalize an optional string value.
 *
 * @param value - Raw optional string value : string | undefined
 *
 * @returns Normalized string or null : string | null
 */
export function normalizeNullableString(value: string | undefined): string | null {
  if (!value) {
    return null
  }

  const normalizedValue = value.trim()

  if (normalizedValue.length === 0) {
    return null
  }

  return normalizedValue
}

/**
 * Normalize price values to a fixed string precision.
 *
 * @param value - Raw price value : string
 *
 * @returns Normalized price string : string
 */
export function normalizePrice(value: string): string {
  const parsedValue = Number(value)

  if (Number.isNaN(parsedValue) || parsedValue < 0) {
    throw new BadRequestException('Price must be a non-negative number')
  }

  return parsedValue.toFixed(2)
}
