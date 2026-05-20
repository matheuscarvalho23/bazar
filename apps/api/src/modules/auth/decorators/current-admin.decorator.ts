import { createParamDecorator, UnauthorizedException } from '@nestjs/common'
import type { IAdminAuthenticatedRequest } from '../interfaces/admin-authenticated-request.interface'
import type { ICurrentAdmin } from '../interfaces/current-admin.interface'
import type { ExecutionContext } from '@nestjs/common'

/**
 * Extract the authenticated admin context from the current request.
 *
 * @param _data - Unused decorator data : unknown
 * @param context - Nest execution context : ExecutionContext
 *
 * @returns Current authenticated admin : ICurrentAdmin
 */
function getCurrentAdminFromContext(_data: unknown, context: ExecutionContext): ICurrentAdmin {
  const request = context.switchToHttp().getRequest<IAdminAuthenticatedRequest>()

  if (!request.currentAdmin) {
    throw new UnauthorizedException('Authenticated admin context not found')
  }

  return request.currentAdmin
}

export const CurrentAdmin = createParamDecorator(getCurrentAdminFromContext)
