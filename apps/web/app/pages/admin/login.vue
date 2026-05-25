<script setup lang="ts">
import type { ILoginAdminRequest } from '~/interfaces/auth/login-admin-request.interface'

definePageMeta({
  middleware: ['admin-guest'],
})

useHead({
  title: 'Admin login',
})

const router = useRouter()
const appToast = useAppToast()
const { loginAdmin, isLoading, error, resetStatus } = useAdminAuth()
const formState = reactive<ILoginAdminRequest>({
  email: '',
  password: '',
})
const validationError = ref<string | null>(null)

const displayError = computed(() => validationError.value ?? error.value)

/**
 * Submit the admin login form.
 *
 * @returns void : Promise<void>
 */
async function handleLoginSubmit(): Promise<void> {
  resetStatus()
  validationError.value = null

  const validationResult = useValidation().loginSchema.safeParse(formState)

  if (!validationResult.success) {
    validationError.value = useValidation().getZodValidationErrorMessage(validationResult.error)
    return
  }

  const loginResponse = await loginAdmin(validationResult.data)

  if (!loginResponse) {
    return
  }

  appToast.showSuccessToast('Login realizado', 'Login realizado com sucesso.')
  await router.push('/admin/dashboard')
}
</script>

<template>
  <section class="flex flex-col gap-7">
    <div class="space-y-2">
      <p class="text-sm font-medium text-primary">Admin</p>
      <h1 class="text-3xl font-bold tracking-normal text-highlighted">Entrar na area admin</h1>
      <p class="text-sm text-muted">Acesse a conta administrativa inicial do bazar.</p>
    </div>

    <UCard>
      <UForm
        :schema="useValidation().loginSchema"
        :state="formState"
        class="space-y-5"
        @submit="handleLoginSubmit"
      >
        <UAlert
          v-if="displayError"
          color="error"
          variant="soft"
          title="Erro ao realizar login"
          :description="displayError"
        />

        <UFormField label="Email" name="email" required>
          <UInput
            v-model="formState.email"
            class="w-full"
            autocomplete="email"
            inputmode="email"
            placeholder="admin@exemplo.com"
            type="email"
          />
        </UFormField>

        <UFormField label="Senha" name="password" required>
          <UInput
            v-model="formState.password"
            class="w-full"
            autocomplete="current-password"
            placeholder="Digite sua senha"
            type="password"
          />
        </UFormField>

        <div class="flex flex-col gap-3 pt-2">
          <UButton block :loading="isLoading" type="submit"> Entrar </UButton>
        </div>
      </UForm>
    </UCard>
  </section>
</template>
