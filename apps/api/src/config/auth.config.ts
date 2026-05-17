import { registerAs } from '@nestjs/config'
import { validateEnvironment } from './environment.validation'
import type { IAuthConfig } from './interfaces/auth-config.interface'
import type { IEnvironmentVariables } from './interfaces/environment-variables.interface'

/**
 * Create the authentication configuration from validated environment variables.
 *
 * @param environment - Validated environment variables : IEnvironmentVariables
 *
 * @returns Authentication configuration : IAuthConfig
 */
export function createAuthConfig(environment: IEnvironmentVariables): IAuthConfig {
  return {
    jwtSecret: environment.JWT_SECRET,
    jwtExpiresIn: environment.JWT_EXPIRES_IN,
    passwordSaltRounds: environment.PASSWORD_SALT_ROUNDS,
  }
}

export default registerAs('auth', (): IAuthConfig => {
  const environment = validateEnvironment(process.env)

  return createAuthConfig(environment)
})
