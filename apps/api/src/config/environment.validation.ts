import type { IEnvironmentVariables } from './interfaces/environment-variables.interface'

/**
 * Validate and normalize environment variables used by the API.
 *
 * @param config - Raw environment variables : Record<string, unknown>
 *
 * @returns Validated environment variables : IEnvironmentVariables
 */
export function validateEnvironment(config: Record<string, unknown>): IEnvironmentVariables {
  const databaseUrl = getRequiredString(config, 'DATABASE_URL')
  const databaseSsl = getOptionalString(config, 'DATABASE_SSL')
  const nodeEnvironment = getOptionalString(config, 'NODE_ENV')

  validateOptionalBoolean(databaseSsl, 'DATABASE_SSL')

  return {
    DATABASE_URL: databaseUrl,
    DATABASE_SSL: databaseSsl,
    NODE_ENV: nodeEnvironment,
  }
}

/**
 * Read a required string from environment config.
 *
 * @param config - Raw environment variables : Record<string, unknown>
 * @param key - Environment variable name : string
 *
 * @returns Environment variable value : string
 */
function getRequiredString(config: Record<string, unknown>, key: string): string {
  const value = config[key]

  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`${key} must be defined`)
  }

  return value
}

/**
 * Read an optional string from environment config.
 *
 * @param config - Raw environment variables : Record<string, unknown>
 * @param key - Environment variable name : string
 *
 * @returns Environment variable value or undefined : string | undefined
 */
function getOptionalString(config: Record<string, unknown>, key: string): string | undefined {
  const value = config[key]

  if (typeof value === 'undefined') {
    return undefined
  }

  if (typeof value !== 'string') {
    throw new Error(`${key} must be a string`)
  }

  return value
}

/**
 * Validate an optional boolean-like environment value.
 *
 * @param value - Environment variable value : string | undefined
 * @param key - Environment variable name : string
 *
 * @returns void
 */
function validateOptionalBoolean(value: string | undefined, key: string): void {
  if (typeof value === 'undefined' || value === 'true' || value === 'false') {
    return
  }

  throw new Error(`${key} must be true or false when defined`)
}
