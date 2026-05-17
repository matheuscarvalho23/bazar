import { registerAs } from '@nestjs/config'
import { validateEnvironment } from './environment.validation'
import type { IDatabaseConfig } from './interfaces/database-config.interface'
import type { IEnvironmentVariables } from './interfaces/environment-variables.interface'

/**
 * Create the database configuration from validated environment variables.
 *
 * @param environment - Validated environment variables : IEnvironmentVariables
 *
 * @returns Database configuration : IDatabaseConfig
 */
export function createDatabaseConfig(environment: IEnvironmentVariables): IDatabaseConfig {
  return {
    url: environment.DATABASE_URL,
    ssl: resolveDatabaseSsl(environment),
    synchronize: false,
  }
}

/**
 * Resolve whether PostgreSQL SSL should be enabled.
 *
 * @param environment - Validated environment variables : IEnvironmentVariables
 *
 * @returns Whether SSL is enabled : boolean
 */
function resolveDatabaseSsl(environment: IEnvironmentVariables): boolean {
  if (environment.DATABASE_SSL === 'true') {
    return true
  }

  if (environment.DATABASE_SSL === 'false') {
    return false
  }

  return environment.NODE_ENV === 'production'
}

export default registerAs('database', (): IDatabaseConfig => {
  const environment = validateEnvironment(process.env)

  return createDatabaseConfig(environment)
})
