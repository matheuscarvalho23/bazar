<script setup lang="ts">
import type { IAdminNavigationProps } from '~/interfaces/admin/admin-navigation-props.interface'

const props = defineProps<IAdminNavigationProps>()
const route = useRoute()
</script>

<template>
  <nav
    aria-label="Navegacao admin"
    class="fixed inset-x-0 bottom-0 z-20 border-t border-default bg-default/95 px-3 pb-[max(env(safe-area-inset-bottom),0.75rem)] pt-2 shadow-lg backdrop-blur md:hidden"
  >
    <div class="mx-auto grid max-w-md grid-cols-3 gap-2">
      <UButton
        v-for="item in props.items"
        :key="item.label"
        :color="item.to === route.path ? 'primary' : 'neutral'"
        :disabled="item.disabled"
        :icon="item.icon"
        :to="item.disabled ? undefined : item.to"
        class="min-w-0 justify-center px-1"
        size="md"
        variant="ghost"
      >
        <span class="truncate text-xs">{{ item.label }}</span>
      </UButton>
    </div>
  </nav>
</template>
