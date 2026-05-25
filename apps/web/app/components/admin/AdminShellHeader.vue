<script setup lang="ts">
import type { IAdminShellHeaderEmits } from '~/interfaces/admin/admin-shell-header-emits.interface'
import type { IAdminShellHeaderProps } from '~/interfaces/admin/admin-shell-header-props.interface'

const props = defineProps<IAdminShellHeaderProps>()
const emit = defineEmits<IAdminShellHeaderEmits>()

const displayName = computed(() => props.admin?.name ?? 'Admin')
const displayEmail = computed(() => props.admin?.email ?? 'Sessao ativa')

/**
 * Emit the admin logout intent to the layout.
 *
 * @returns void
 */
function handleLogoutClick(): void {
  emit('onLogout')
}
</script>

<template>
  <header class="sticky top-0 z-20 border-b border-default bg-default/95 backdrop-blur">
    <UContainer class="flex min-h-16 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
      <NuxtLink
        class="flex min-w-0 items-center gap-3 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        to="/admin/dashboard"
      >
        <span
          class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary text-inverted"
        >
          <UIcon class="size-5" name="i-lucide-store" />
        </span>

        <span class="min-w-0">
          <span class="block truncate text-sm font-semibold text-highlighted">Bazar admin</span>
          <span class="block truncate text-xs text-muted">Painel operacional</span>
        </span>
      </NuxtLink>

      <UButton
        color="neutral"
        icon="i-lucide-log-out"
        type="button"
        variant="ghost"
        @click="handleLogoutClick"
      >
        Sair
      </UButton>
    </UContainer>

    <UContainer class="border-t border-default px-4 py-2 sm:px-6 lg:px-8">
      <div class="flex min-w-0 items-center gap-2 text-sm">
        <UIcon class="size-4 shrink-0 text-muted" name="i-lucide-user-round" />
        <p class="min-w-0 truncate font-medium text-toned">
          {{ displayName }}
        </p>
        <span class="text-muted">/</span>
        <p class="min-w-0 truncate text-muted">
          {{ displayEmail }}
        </p>
      </div>
    </UContainer>
  </header>
</template>
