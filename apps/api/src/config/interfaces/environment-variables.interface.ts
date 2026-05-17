import type { IDatabaseEnvironmentVariables } from './database-environment-variables.interface'

export interface IEnvironmentVariables extends IDatabaseEnvironmentVariables {
  readonly JWT_SECRET: string
  readonly JWT_EXPIRES_IN: string
  readonly PASSWORD_SALT_ROUNDS: number
}
