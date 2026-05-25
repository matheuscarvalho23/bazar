import type { IUseAppToastReturn } from '~/interfaces/feedback/use-app-toast-return.interface'

/**
 * Manage app toast notifications with local visual defaults.
 *
 * @returns App toast helpers : IUseAppToastReturn
 */
export function useAppToast(): IUseAppToastReturn {
  const toast = useToast()

  /**
   * Show a success toast with the original green success treatment.
   *
   * @param title - Toast title : string
   * @param description - Toast description : string | undefined
   *
   * @returns void
   */
  function showSuccessToast(title: string, description?: string): void {
    toast.add({
      title,
      description,
      color: 'success',
      icon: 'i-lucide-circle-check',
      progress: {
        ui: {
          indicator: 'bg-green-500',
        },
      },
      ui: {
        icon: 'text-green-500',
        root: 'focus-visible:ring-green-500',
      },
    })
  }

  return {
    showSuccessToast,
  }
}
