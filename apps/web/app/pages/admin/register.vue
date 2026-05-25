<script setup lang="ts">
import type { IRegisterAdminRequest } from '~/interfaces/auth/register-admin-request.interface'

useHead({
  title: 'Admin registration',
})

const router = useRouter()
const toast = useToast()
const { registerAdmin, isLoading, error, resetStatus } = useAdminAuth()
const formState = reactive<IRegisterAdminRequest>({
  name: '',
  email: '',
  password: '',
  phone: '',
})
const validationError = ref<string | null>(null)

const displayError = computed(() => validationError.value ?? error.value)

/**
 * Submit the first admin registration form.
 *
 * @returns void : Promise<void>
 */
async function handleRegisterSubmit(): Promise<void> {
  resetStatus()
  validationError.value = null

  const validationResult = useValidation().registerSchema.safeParse(formState)

  if (!validationResult.success) {
    validationError.value = useValidation().getZodValidationErrorMessage(validationResult.error)
    return
  }

  try {
    await registerAdmin(validationResult.data)
    await toast.add({
      title: 'Cadastro criado',
      description: 'Redirecionando para o login.',
      color: 'success',
    })
    await router.push('/admin/login')
  } catch {
    return
  }
}
</script>

<template>
  <main class="min-h-screen bg-default px-4 py-12">
    <section class="mx-auto flex w-full max-w-md flex-col gap-6">
      <div class="space-y-2">
        <p class="text-sm font-medium text-primary">Admin</p>
        <h1 class="text-3xl font-bold tracking-normal text-highlighted">
          Criar primeiro administrador
        </h1>
        <p class="text-sm text-muted">
          Cadastre a conta inicial que tera acesso a area administrativa.
        </p>
      </div>

      <UCard>
        <UForm
          :schema="useValidation().registerSchema"
          :state="formState"
          class="space-y-4"
          @submit="handleRegisterSubmit"
        >
          <UAlert
            v-if="displayError"
            color="error"
            variant="soft"
            title="Nao foi possivel criar o cadastro"
            :description="displayError"
          />

          <UFormField label="Nome" name="name" required>
            <UInput
              v-model="formState.name"
              class="w-full"
              autocomplete="name"
              placeholder="Nome do administrador"
            />
          </UFormField>

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
              autocomplete="new-password"
              placeholder="Crie uma senha segura"
              type="password"
            />
          </UFormField>

          <UFormField label="Telefone" name="phone" hint="Opcional">
            <UInput
              v-model="formState.phone"
              class="w-full"
              autocomplete="tel"
              inputmode="tel"
              placeholder="(00) 00000-0000"
              type="tel"
            />
          </UFormField>

          <div class="flex flex-col gap-3 pt-2">
            <UButton block :loading="isLoading" type="submit"> Criar administrador </UButton>

            <UButton
              block
              color="neutral"
              :disabled="isLoading"
              to="/admin/login"
              type="button"
              variant="ghost"
            >
              Ir para login
            </UButton>
          </div>
        </UForm>
      </UCard>
    </section>
  </main>
</template>
