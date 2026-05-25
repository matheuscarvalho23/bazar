export default defineAppConfig({
  ui: {
    colors: {
      primary: 'bazar',
      secondary: 'linen',
      success: 'bazar',
      info: 'linen',
      warning: 'linen',
      error: 'clay',
      neutral: 'linen',
    },
    button: {
      slots: {
        base: 'min-h-12 cursor-pointer',
      },
      defaultVariants: {
        size: 'xl',
      },
    },
    input: {
      slots: {
        base: 'min-h-12',
      },
      defaultVariants: {
        size: 'xl',
      },
    },
    toaster: {
      defaultVariants: {
        position: 'top-right',
      },
    },
  },
})
