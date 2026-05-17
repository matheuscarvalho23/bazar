import type { IEnvironmentVariables } from './interfaces/environment-variables.interface'
import type { IDatabaseEnvironmentVariables } from './interfaces/database-environment-variables.interface'

/**
 * Validate and normalize environment variables used by the API.
 *
 * @param config - Raw environment variables : Record<string, unknown>
 *
 * @returns Validated environment variables : IEnvironmentVariables
 */
export function validateEnvironment(config: Record<string, unknown>): IEnvironmentVariables {
  const databaseEnvironment = validateDatabaseEnvironment(config)
  const jwtSecret = getRequiredString(config, 'JWT_SECRET')
  const jwtExpiresIn = getRequiredString(config, 'JWT_EXPIRES_IN')
  const passwordSaltRounds = getRequiredInteger(config, 'PASSWORD_SALT_ROUNDS')

  validateIntegerRange(passwordSaltRounds, 'PASSWORD_SALT_ROUNDS', 10, 31)

  return {
    ...databaseEnvironment,
    JWT_SECRET: jwtSecret,
    JWT_EXPIRES_IN: jwtExpiresIn,
    PASSWORD_SALT_ROUNDS: passwordSaltRounds,
  }
}

/**
 * Validate and normalize database environment variables.
 *
 * @param config - Raw environment variables : Record<string, unknown>
 *
 * @returns Validated database environment variables : IDatabaseEnvironmentVariables
 */
export function validateDatabaseEnvironment(
  config: Record<string, unknown>,
): IDatabaseEnvironmentVariables {
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
 * Read a required integer from environment config.
 *
 * @param config - Raw environment variables : Record<string, unknown>
 * @param key - Environment variable name : string
 *
 * @returns Environment variable value : number
 */
function getRequiredInteger(config: Record<string, unknown>, key: string): number {
  const value = getRequiredString(config, key)
  const numberValue = Number(value)

  if (!Number.isInteger(numberValue)) {
    throw new Error(`${key} must be an integer`)
  }

  return numberValue
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

/**
 * Validate whether an integer is within the accepted range.
 *
 * @param value - Integer value : number
 * @param key - Environment variable name : string
 * @param minimum - Minimum accepted value : number
 * @param maximum - Maximum accepted value : number
 *
 * @returns void
 */
function validateIntegerRange(value: number, key: string, minimum: number, maximum: number): void {
  if (value >= minimum && value <= maximum) {
    return
  }

  throw new Error(`${key} must be between ${minimum} and ${maximum}`)
}
