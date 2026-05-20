import { UnauthorizedException } from '@nestjs/common'
import { AdminJwtGuard } from './admin-jwt.guard'
import type { IAdminAuthenticatedRequest } from '../interfaces/admin-authenticated-request.interface'
import type { ExecutionContext } from '@nestjs/common'
import type { JwtService } from '@nestjs/jwt'

describe('AdminJwtGuard', () => {
  let guard: AdminJwtGuard
  let jwtService: jest.Mocked<JwtService>

  beforeEach(() => {
    jwtService = {
      verifyAsync: jest.fn(),
    } as unknown as jest.Mocked<JwtService>

    guard = new AdminJwtGuard(jwtService)
  })

  /**
   * Build a minimal HTTP execution context for guard tests.
   *
   * @param request - Request object passed to the guard : IAdminAuthenticatedRequest
   *
   * @returns Nest execution context : ExecutionContext
   */
  function buildExecutionContext(request: IAdminAuthenticatedRequest): ExecutionContext {
    return {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue(request),
      }),
    } as unknown as ExecutionContext
  }

  it('validates a bearer token and attaches the current admin context', async () => {
    const request: IAdminAuthenticatedRequest = {
      headers: {
        authorization: 'Bearer valid-token',
      },
    }

    jwtService.verifyAsync.mockResolvedValue({ sub: 'admin-1' })

    await expect(guard.canActivate(buildExecutionContext(request))).resolves.toBe(true)

    expect(jwtService.verifyAsync).toHaveBeenCalledWith('valid-token')
    expect(request.currentAdmin).toEqual({
      id: 'admin-1',
    })
  })

  it('rejects requests without an authorization header', async () => {
    const request: IAdminAuthenticatedRequest = {
      headers: {},
    }

    await expect(guard.canActivate(buildExecutionContext(request))).rejects.toBeInstanceOf(
      UnauthorizedException,
    )

    expect(jwtService.verifyAsync).not.toHaveBeenCalled()
  })

  it('rejects requests with malformed authorization headers', async () => {
    const request: IAdminAuthenticatedRequest = {
      headers: {
        authorization: 'Token invalid-token',
      },
    }

    await expect(guard.canActivate(buildExecutionContext(request))).rejects.toBeInstanceOf(
      UnauthorizedException,
    )

    expect(jwtService.verifyAsync).not.toHaveBeenCalled()
  })

  it('rejects invalid tokens', async () => {
    const request: IAdminAuthenticatedRequest = {
      headers: {
        authorization: 'Bearer invalid-token',
      },
    }

    jwtService.verifyAsync.mockRejectedValue(new Error('invalid token'))

    await expect(guard.canActivate(buildExecutionContext(request))).rejects.toBeInstanceOf(
      UnauthorizedException,
    )
  })

  it('rejects valid tokens without a usable subject', async () => {
    const request: IAdminAuthenticatedRequest = {
      headers: {
        authorization: 'Bearer valid-token',
      },
    }

    jwtService.verifyAsync.mockResolvedValue({ sub: '' })

    await expect(guard.canActivate(buildExecutionContext(request))).rejects.toBeInstanceOf(
      UnauthorizedException,
    )
  })
})
