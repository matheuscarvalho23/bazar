import { z, type ZodError, type ZodString, type ZodType } from 'zod'
import type { IRegisterAdminRequest } from '~/interfaces/auth/register-admin-request.interface'
import type { IUseValidationReturn } from '~/interfaces/validation/use-validation-return.interface'

/**
 * Return reusable frontend validation schemas and helpers.
 *
 * @returns Validation schemas and helpers : IUseValidationReturn
 */
export default function useValidation(): IUseValidationReturn {
  /**
   * Return a required trimmed string schema.
   *
   * @param message - Validation message : string
   *
   * @returns Required string schema : ZodString
   */
  function requiredString(message = 'Campo obrigatorio.'): ZodString {
    return z.string().trim().min(1, message)
  }

  /**
   * Return a required email schema.
   *
   * @returns Required email schema : ZodString
   */
  function validEmail(): ZodString {
    return requiredString('Informe o email do administrador.').email('Informe um email valido.')
  }

  const registerSchema: ZodType<IRegisterAdminRequest> = z.object({
    name: requiredString('Informe o nome do administrador.'),
    email: validEmail(),
    password: requiredString('Informe a senha do administrador.'),
    phone: z
      .string()
      .trim()
      .optional()
      .transform((value) => (value === '' ? undefined : value)),
  })

  /**
   * Return the first safe user-facing Zod validation message.
   *
   * @param error - Zod validation error : ZodError
   *
   * @returns Validation message : string
   */
  function getZodValidationErrorMessage(error: ZodError): string {
    return error.issues[0]?.message ?? 'Revise os dados informados.'
  }

  return {
    requiredString,
    validEmail,
    registerSchema,
    getZodValidationErrorMessage,
  }
}
