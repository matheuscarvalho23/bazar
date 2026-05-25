<script setup lang="ts">
import type { IAdminNavigationItem } from '~/interfaces/admin/admin-navigation-item.interface'

const router = useRouter()
const route = useRoute()
const { admin, logoutAdmin } = useAdminAuth()

const mobileNavigationItems: IAdminNavigationItem[] = [
  {
    label: 'Painel',
    icon: 'i-lucide-layout-dashboard',
    to: '/admin/dashboard',
  },
  {
    label: 'Produtos',
    icon: 'i-lucide-package',
    disabled: true,
  },
  {
    label: 'Estoque',
    icon: 'i-lucide-boxes',
    disabled: true,
  },
]

const desktopNavigationItems: IAdminNavigationItem[] = [
  ...mobileNavigationItems,
  {
    label: 'Interesses',
    icon: 'i-lucide-message-circle',
    disabled: true,
  },
  {
    label: 'Importacoes',
    icon: 'i-lucide-file-up',
    disabled: true,
  },
]

/**
 * Clear the in-memory admin session and return to login.
 *
 * @returns void : Promise<void>
 */
async function handleLogout(): Promise<void> {
  logoutAdmin()
  await router.push('/admin/login')
}
</script>

<template>
  <div class="min-h-dvh overflow-x-hidden bg-default pb-24 md:pb-0">
    <AdminShellHeader :admin="admin" @on-logout="handleLogout" />

    <div class="mx-auto flex w-full max-w-7xl">
      <aside class="hidden w-64 shrink-0 border-r border-default px-4 py-6 md:block">
        <nav aria-label="Navegacao admin" class="flex flex-col gap-2">
          <UButton
            v-for="item in desktopNavigationItems"
            :key="item.label"
            :color="item.to === route.path ? 'primary' : 'neutral'"
            :disabled="item.disabled"
            :icon="item.icon"
            :to="item.disabled ? undefined : item.to"
            class="justify-start"
            variant="ghost"
          >
            <span class="truncate">{{ item.label }}</span>
          </UButton>
        </nav>
      </aside>

      <main class="min-w-0 flex-1 px-4 py-5 sm:px-6 lg:px-8">
        <slot />
      </main>
    </div>

    <AdminMobileNavigation :items="mobileNavigationItems" />
  </div>
</template>
