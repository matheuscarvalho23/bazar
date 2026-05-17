export interface IAuthConfig {
  readonly jwtSecret: string
  readonly jwtExpiresIn: string
  readonly passwordSaltRounds: number
}
