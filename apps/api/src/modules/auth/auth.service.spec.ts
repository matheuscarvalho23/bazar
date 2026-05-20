import { ConflictException, UnauthorizedException } from '@nestjs/common'
import { compare, hash } from 'bcrypt'
import { AuthService } from './auth.service'
import type { IAuthConfig } from '../../config/interfaces/auth-config.interface'
import type { ConfigService } from '@nestjs/config'
import type { JwtService } from '@nestjs/jwt'
import type { AdminsService } from '../admins/admins.service'
import type { IAdminAuthenticationData } from '../admins/interfaces/admin-authentication-data.interface'
import type { IAdminResponse } from '../admins/interfaces/admin-response.interface'

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}))

const mockedCompare = compare as jest.MockedFunction<
  (data: string, encrypted: string) => Promise<boolean>
>
const mockedHash = hash as jest.MockedFunction<
  (data: string, saltOrRounds: string | number) => Promise<string>
>

describe('AuthService', () => {
  let authService: AuthService
  let adminsService: jest.Mocked<AdminsService>
  let configService: jest.Mocked<ConfigService>
  let jwtService: jest.Mocked<JwtService>

  const createdAt = new Date('2026-05-19T10:00:00.000Z')
  const updatedAt = new Date('2026-05-19T10:30:00.000Z')

  const adminResponse: IAdminResponse = {
    id: 'admin-1',
    name: 'Store Owner',
    email: 'owner@example.com',
    phone: null,
    createdAt,
    updatedAt,
  }

  const adminAuthenticationData: IAdminAuthenticationData = {
    ...adminResponse,
    passwordHash: 'hashed-password',
  }

  const authConfig: IAuthConfig = {
    jwtSecret: 'test-jwt-secret',
    jwtExpiresIn: '15m',
    passwordSaltRounds: 10,
  }

  beforeEach(() => {
    adminsService = {
      findAdminById: jest.fn(),
      findAdminByEmail: jest.fn(),
      findAdminAuthenticationByEmail: jest.fn(),
      countAdmins: jest.fn(),
      createAdmin: jest.fn(),
      saveAdmin: jest.fn(),
    } as unknown as jest.Mocked<AdminsService>

    configService = {
      getOrThrow: jest.fn().mockReturnValue(authConfig),
    } as unknown as jest.Mocked<ConfigService>

    jwtService = {
      signAsync: jest.fn(),
    } as unknown as jest.Mocked<JwtService>

    mockedCompare.mockReset()
    mockedHash.mockReset()

    authService = new AuthService(adminsService, configService, jwtService)
  })

  it('registers the first admin with normalized email and hashed password', async () => {
    adminsService.findAdminByEmail.mockResolvedValue(null)
    adminsService.countAdmins.mockResolvedValue(0)
    adminsService.createAdmin.mockResolvedValue(adminResponse)
    mockedHash.mockResolvedValue('hashed-password')

    const result = await authService.registerFirstAdmin({
      name: 'Store Owner',
      email: ' OWNER@Example.COM ',
      password: 'plain-password',
    })

    expect(result).toEqual(adminResponse)
    expect(adminsService.findAdminByEmail).toHaveBeenCalledWith('owner@example.com')
    expect(adminsService.countAdmins).toHaveBeenCalledTimes(1)
    expect(configService.getOrThrow).toHaveBeenCalledWith('auth')
    expect(mockedHash).toHaveBeenCalledWith('plain-password', authConfig.passwordSaltRounds)
    expect(adminsService.createAdmin).toHaveBeenCalledWith({
      name: 'Store Owner',
      email: 'owner@example.com',
      password: 'hashed-password',
      phone: null,
    })
  })

  it('blocks first admin registration when another admin already exists', async () => {
    adminsService.findAdminByEmail.mockResolvedValue(null)
    adminsService.countAdmins.mockResolvedValue(1)

    await expect(
      authService.registerFirstAdmin({
        name: 'Store Owner',
        email: 'owner@example.com',
        password: 'plain-password',
      }),
    ).rejects.toBeInstanceOf(ConflictException)

    expect(mockedHash).not.toHaveBeenCalled()
    expect(adminsService.createAdmin).not.toHaveBeenCalled()
  })

  it('rejects duplicate admin email registration', async () => {
    adminsService.findAdminByEmail.mockResolvedValue(adminResponse)

    await expect(
      authService.registerFirstAdmin({
        name: 'Store Owner',
        email: 'OWNER@example.com',
        password: 'plain-password',
      }),
    ).rejects.toBeInstanceOf(ConflictException)

    expect(adminsService.findAdminByEmail).toHaveBeenCalledWith('owner@example.com')
    expect(adminsService.countAdmins).not.toHaveBeenCalled()
    expect(mockedHash).not.toHaveBeenCalled()
    expect(adminsService.createAdmin).not.toHaveBeenCalled()
  })

  it('logs in an admin with valid credentials', async () => {
    adminsService.findAdminAuthenticationByEmail.mockResolvedValue(adminAuthenticationData)
    mockedCompare.mockResolvedValue(true)
    jwtService.signAsync.mockResolvedValue('access-token')

    const result = await authService.loginAdmin({
      email: ' OWNER@example.com ',
      password: 'plain-password',
    })

    expect(result).toEqual({
      accessToken: 'access-token',
      admin: adminResponse,
    })
    expect(result.admin).not.toHaveProperty('passwordHash')
    expect(adminsService.findAdminAuthenticationByEmail).toHaveBeenCalledWith('owner@example.com')
    expect(mockedCompare).toHaveBeenCalledWith('plain-password', 'hashed-password')
    expect(jwtService.signAsync).toHaveBeenCalledWith({ sub: 'admin-1' })
  })

  it('rejects login when the email is not registered', async () => {
    adminsService.findAdminAuthenticationByEmail.mockResolvedValue(null)

    await expect(
      authService.loginAdmin({
        email: 'missing@example.com',
        password: 'plain-password',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException)

    expect(mockedCompare).not.toHaveBeenCalled()
    expect(jwtService.signAsync).not.toHaveBeenCalled()
  })

  it('rejects login when the password is invalid', async () => {
    adminsService.findAdminAuthenticationByEmail.mockResolvedValue(adminAuthenticationData)
    mockedCompare.mockResolvedValue(false)

    await expect(
      authService.loginAdmin({
        email: 'owner@example.com',
        password: 'wrong-password',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException)

    expect(mockedCompare).toHaveBeenCalledWith('wrong-password', 'hashed-password')
    expect(jwtService.signAsync).not.toHaveBeenCalled()
  })
})
