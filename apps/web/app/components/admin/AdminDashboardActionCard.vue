<script setup lang="ts">
import type { IAdminDashboardActionCardProps } from '~/interfaces/admin/admin-dashboard-action-card-props.interface'

const props = defineProps<IAdminDashboardActionCardProps>()
</script>

<template>
  <UCard class="h-full">
    <div class="flex h-full flex-col gap-4">
      <div class="flex items-start justify-between gap-3">
        <div class="flex min-w-0 items-start gap-3">
          <span
            class="flex size-11 shrink-0 items-center justify-center rounded-lg bg-muted text-primary"
          >
            <UIcon class="size-5" :name="props.item.icon" />
          </span>

          <div class="min-w-0 space-y-1">
            <h2 class="truncate text-base font-semibold text-highlighted">
              {{ props.item.label }}
            </h2>
            <p class="text-sm leading-5 text-muted">
              {{ props.item.description }}
            </p>
          </div>
        </div>

        <UBadge v-if="props.item.disabled" color="neutral" variant="soft">Indisponivel</UBadge>
      </div>

      <div class="mt-auto">
        <UButton
          block
          :disabled="props.item.disabled"
          :icon="props.item.disabled ? 'i-lucide-lock' : 'i-lucide-arrow-right'"
          :to="props.item.disabled ? undefined : props.item.to"
          color="neutral"
          variant="soft"
        >
          {{ props.item.disabled ? 'Aguardando contrato' : 'Abrir' }}
        </UButton>
      </div>
    </div>
  </UCard>
</template>
