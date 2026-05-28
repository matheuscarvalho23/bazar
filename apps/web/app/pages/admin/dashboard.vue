<script setup lang="ts">
import type { IAdminNavigationItem } from '~/interfaces/admin/admin-navigation-item.interface'

definePageMeta({
  layout: 'admin',
  middleware: ['admin-auth'],
})

useHead({
  title: 'Admin dashboard',
})

const { isLoading } = useAdminAuth()

const dashboardAreas: IAdminNavigationItem[] = [
  {
    label: 'Produtos',
    icon: 'i-lucide-package',
    description: 'Area reservada para cadastro, edicao e organizacao de produtos.',
    disabled: true,
  },
  {
    label: 'Estoque',
    icon: 'i-lucide-boxes',
    description: 'Area reservada para controle de quantidade e movimentacoes.',
    disabled: true,
  },
  {
    label: 'Interesses',
    icon: 'i-lucide-message-circle',
    description: 'Area reservada para acompanhar contatos e reservas de clientes.',
    disabled: true,
  },
  {
    label: 'Importacoes',
    icon: 'i-lucide-file-up',
    description: 'Area reservada para importar produtos quando o contrato existir.',
    disabled: true,
  },
]
</script>

<template>
  <section class="space-y-6">
    <div v-if="isLoading" class="space-y-4">
      <USkeleton class="h-24 w-full" />
      <USkeleton class="h-32 w-full" />
      <USkeleton class="h-32 w-full" />
    </div>

    <template v-else>
      <div class="space-y-2">
        <p class="text-sm font-medium text-primary">Dashboard</p>
        <p class="max-w-2xl text-sm leading-6 text-muted">
          Este e o ponto inicial protegido da administracao do bazar.
        </p>
      </div>

      <UAlert
        color="neutral"
        icon="i-lucide-shield-check"
        title="Area admin protegida"
        variant="soft"
        description="Os modulos operacionais aparecem como indisponiveis ate que os contratos de backend sejam criados em fases futuras."
      />

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminDashboardActionCard v-for="area in dashboardAreas" :key="area.label" :item="area" />
      </div>

      <UEmpty
        icon="i-lucide-inbox"
        title="Nenhum fluxo operacional ativo nesta fase"
        description="A fundacao da dashboard esta pronta sem buscar dados falsos ou chamar endpoints inexistentes."
      />
    </template>
  </section>
</template>
