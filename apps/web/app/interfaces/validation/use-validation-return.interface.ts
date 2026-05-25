import type { ZodError, ZodString, ZodType } from 'zod'
import type { IRegisterAdminRequest } from '~/interfaces/auth/register-admin-request.interface'

export interface IUseValidationReturn {
  requiredString(message?: string): ZodString
  validEmail(): ZodString
  registerSchema: ZodType<IRegisterAdminRequest>
  getZodValidationErrorMessage(error: ZodError): string
}
