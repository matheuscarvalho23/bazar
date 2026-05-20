import { Inject, Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import type { IAdminAuthenticatedRequest } from '../interfaces/admin-authenticated-request.interface'
import type { IAdminJwtPayload } from '../interfaces/admin-jwt-payload.interface'
import type { CanActivate, ExecutionContext } from '@nestjs/common'

@Injectable()
export class AdminJwtGuard implements CanActivate {
  constructor(
    @Inject(JwtService)
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Validate the admin access token and attach the current admin context.
   *
   * @param context - Nest execution context : ExecutionContext
   *
   * @returns Whether the request can continue : Promise<boolean>
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<IAdminAuthenticatedRequest>()
    const token = this.extractBearerToken(request)
    const payload = await this.verifyToken(token)

    request.currentAdmin = {
      id: payload.sub,
    }

    return true
  }

  /**
   * Extract the Bearer token from an authenticated admin request.
   *
   * @param request - Authenticated request candidate : IAdminAuthenticatedRequest
   *
   * @returns Bearer token : string
   */
  private extractBearerToken(request: IAdminAuthenticatedRequest): string {
    const authorization = request.headers.authorization

    if (typeof authorization !== 'string') {
      throw new UnauthorizedException('Invalid or missing access token')
    }

    const authorizationParts = authorization.split(' ')

    if (authorizationParts.length !== 2) {
      throw new UnauthorizedException('Invalid or missing access token')
    }

    const [scheme, token] = authorizationParts

    if (scheme !== 'Bearer' || token.trim() === '') {
      throw new UnauthorizedException('Invalid or missing access token')
    }

    return token
  }

  /**
   * Verify a JWT and normalize invalid token failures.
   *
   * @param token - Bearer token : string
   *
   * @returns Verified admin JWT payload : Promise<IAdminJwtPayload>
   */
  private async verifyToken(token: string): Promise<IAdminJwtPayload> {
    try {
      const payload = await this.jwtService.verifyAsync<IAdminJwtPayload>(token)

      if (typeof payload.sub !== 'string' || payload.sub.trim() === '') {
        throw new UnauthorizedException('Invalid or missing access token')
      }

      return payload
    } catch {
      throw new UnauthorizedException('Invalid or missing access token')
    }
  }
}
