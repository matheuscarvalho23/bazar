export default defineNuxtRouteMiddleware(() => {
  const adminSessionStore = useAdminSessionStore()
  const { isAuthenticated } = storeToRefs(adminSessionStore)

  if (isAuthenticated.value) {
    return navigateTo('/admin/dashboard')
  }
})
