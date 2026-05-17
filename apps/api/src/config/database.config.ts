import { registerAs } from '@nestjs/config'
import { validateDatabaseEnvironment } from './environment.validation'
import type { IDatabaseConfig } from './interfaces/database-config.interface'
import type { IDatabaseEnvironmentVariables } from './interfaces/database-environment-variables.interface'

/**
 * Create the database configuration from validated environment variables.
 *
 * @param environment - Validated database environment variables : IDatabaseEnvironmentVariables
 *
 * @returns Database configuration : IDatabaseConfig
 */
export function createDatabaseConfig(environment: IDatabaseEnvironmentVariables): IDatabaseConfig {
  return {
    url: environment.DATABASE_URL,
    ssl: resolveDatabaseSsl(environment),
    synchronize: false,
  }
}

/**
 * Resolve whether PostgreSQL SSL should be enabled.
 *
 * @param environment - Validated database environment variables : IDatabaseEnvironmentVariables
 *
 * @returns Whether SSL is enabled : boolean
 */
function resolveDatabaseSsl(environment: IDatabaseEnvironmentVariables): boolean {
  if (environment.DATABASE_SSL === 'true') {
    return true
  }

  if (environment.DATABASE_SSL === 'false') {
    return false
  }

  return environment.NODE_ENV === 'production'
}

export default registerAs('database', (): IDatabaseConfig => {
  const environment = validateDatabaseEnvironment(process.env)

  return createDatabaseConfig(environment)
})
