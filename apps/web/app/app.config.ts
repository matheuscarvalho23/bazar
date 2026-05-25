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
        base: 'cursor-pointer',
      },
      defaultVariants: {
        size: 'lg',
      },
    },
    input: {
      defaultVariants: {
        size: 'lg',
      },
    },
    toaster: {
      defaultVariants: {
        position: 'top-right',
      },
    },
  },
})
