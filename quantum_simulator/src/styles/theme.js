/* src/styles/theme.js */
export const theme = {
  colors: {
    primary: {
      50: '#f0f7ff',
      100: '#e0edff',
      200: '#b3d4ff',
      300: '#85baff',
      400: '#579fff',
      500: '#3b82f6',
      600: '#2b6cbf',
      700: '#1e4f99',
      800: '#143873',
      900: '#0c2659',
    },
    neutral: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
    },
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#06b6d4',
    quantum: {
      superposition: '#8b5cf6',
      entangled: '#f97316',
      measured: '#06b6d4',
      classical: '#6b7280',
    },
    gates: {
      hadamard: '#3b82f6',
      pauliX: '#ef4444',
      pauliY: '#10b981',
      pauliZ: '#f59e0b',
      phaseS: '#8b5cf6',
      phaseT: '#f97316',
      controlled: '#06b6d4',
      measurement: '#6b7280',
    },
  },
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      mono: ['Fira Code', 'monospace'],
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
    },
  },
  spacing: {
    1: '0.25rem',
    2: '0.5rem',
    3: '0.75rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    8: '2rem',
    10: '2.5rem',
    12: '3rem',
    16: '4rem',
  },
  borderRadius: {
    sm: '0.25rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    '2xl': '1.5rem',
    full: '9999px',
  },
  shadows: {
    sm: '0 2px 4px rgba(0, 0, 0, 0.05)',
    md: '0 4px 8px rgba(0, 0, 0, 0.1)',
    lg: '0 8px 16px rgba(0, 0, 0, 0.15)',
    glow: '0 0 12px rgba(59, 130, 246, 0.3)',
  },
  animation: {
    duration: {
      fast: '150ms',
      normal: '200ms',
      slow: '300ms',
    },
    easing: {
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },
};

export const generateCSSVariables = (theme) => {
  return `
    :root {
      --color-primary-50: ${theme.colors.primary[50]};
      --color-primary-100: ${theme.colors.primary[100]};
      --color-primary-200: ${theme.colors.primary[200]};
      --color-primary-300: ${theme.colors.primary[300]};
      --color-primary-400: ${theme.colors.primary[400]};
      --color-primary-500: ${theme.colors.primary[500]};
      --color-primary-600: ${theme.colors.primary[600]};
      --color-primary-700: ${theme.colors.primary[700]};
      --color-primary-800: ${theme.colors.primary[800]};
      --color-primary-900: ${theme.colors.primary[900]};

      --color-neutral-50: ${theme.colors.neutral[50]};
      --color-neutral-100: ${theme.colors.neutral[100]};
      --color-neutral-200: ${theme.colors.neutral[200]};
      --color-neutral-300: ${theme.colors.neutral[300]};
      --color-neutral-400: ${theme.colors.neural[400]};
      --color-neutral-500: ${theme.colors.neutral[500]};
      --color-neutral-600: ${theme.colors.neutral[600]};
      --color-neutral-700: ${theme.colors.neutral[700]};
      --color-neutral-800: ${theme.colors.neutral[800]};
      --color-neutral-900: ${theme.colors.neutral[900]};

      --color-success: ${theme.colors.success};
      --color-warning: ${theme.colors.warning};
      --color-error: ${theme.colors.error};
      --color-info: ${theme.colors.info};

      --font-family-sans: ${theme.typography.fontFamily.sans.join(', ')};
      --font-family-mono: ${theme.typography.fontFamily.mono.join(', ')};

      --font-size-xs: ${theme.typography.fontSize.xs};
      --font-size-sm: ${theme.typography.fontSize.sm};
      --font-size-base: ${theme.typography.fontSize.base};
      --font-size-lg: ${theme.typography.fontSize.lg};
      --font-size-xl: ${theme.typography.fontSize.xl};
      --font-size-2xl: ${theme.typography.fontSize['2xl']};
      --font-size-3xl: ${theme.typography.fontSize['3xl']};
      --font-size-4xl: ${theme.typography.fontSize['4xl']};

      --space-1: ${theme.spacing[1]};
      --space-2: ${theme.spacing[2]};
      --space-3: ${theme.spacing[3]};
      --space-4: ${theme.spacing[4]};
      --space-5: ${theme.spacing[5]};
      --space-6: ${theme.spacing[6]};
      --space-8: ${theme.spacing[8]};
      --space-10: ${theme.spacing[10]};
      --space-12: ${theme.spacing[12]};
      --space-16: ${theme.spacing[16]};

      --radius-sm: ${theme.borderRadius.sm};
      --radius-md: ${theme.borderRadius.md};
      --radius-lg: ${theme.borderRadius.lg};
      --radius-xl: ${theme.borderRadius.xl};
      --radius-2xl: ${theme.borderRadius['2xl']};
      --radius-full: ${theme.borderRadius.full};

      --shadow-sm: ${theme.shadows.sm};
      --shadow-md: ${theme.shadows.md};
      --shadow-lg: ${theme.shadows.lg};
      --shadow-glow: ${theme.shadows.glow};

      --duration-fast: ${theme.animation.duration.fast};
      --duration-normal: ${theme.animation.duration.normal};
      --duration-slow: ${theme.animation.duration.slow};
      --ease-in-out: ${theme.animation.easing.easeInOut};
    }
  `;
};