import type { ZodError, ZodString, ZodType } from 'zod'
import type { ILoginAdminRequest } from '~/interfaces/auth/login-admin-request.interface'
import type { IRegisterAdminRequest } from '~/interfaces/auth/register-admin-request.interface'

export interface IUseValidationReturn {
  requiredString(message?: string): ZodString
  validEmail(): ZodString
  registerSchema: ZodType<IRegisterAdminRequest>
  loginSchema: ZodType<ILoginAdminRequest>
  getZodValidationErrorMessage(error: ZodError): string
}
