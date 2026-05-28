export default defineNuxtRouteMiddleware(async () => {
  const adminSessionStore = useAdminSessionStore()
  const { accessToken, admin, isAuthenticated } = storeToRefs(adminSessionStore)

  if (!isAuthenticated.value && accessToken.value !== null && admin.value === null) {
    await adminSessionStore.fetchCurrentAdmin().catch(() => null)
  }

  if (!isAuthenticated.value) {
    return navigateTo('/admin/login')
  }
})
