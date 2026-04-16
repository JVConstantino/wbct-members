/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── Brand (Blue) ──
        'brand-primary':        'var(--color-brand-primary)',
        'brand-primary-hover':  'var(--color-brand-primary-hover)',
        'brand-primary-active': 'var(--color-brand-primary-active)',
        'brand-primary-light':  'var(--color-brand-primary-light)',
        'brand-strong':         'var(--color-brand-strong)',
        'brand-strong-hover':   'var(--color-brand-strong-hover)',

        // ── Acento (Cyan) ──
        'accent':       'var(--color-accent)',
        'accent-hover': 'var(--color-accent-hover)',
        'accent-light': 'var(--color-accent-light)',

        // ── Texto ──
        'text-primary':   'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-muted':     'var(--text-muted)',
        'text-on-brand':  'var(--color-text-on-brand)',

        // ── Superfícies ──
        'surface-page':     'var(--surface-page)',
        'surface-section':  'var(--surface-section)',
        'surface-card':     'var(--surface-card)',
        'surface-subtle':   'var(--surface-subtle)',
        'surface-elevated': 'var(--surface-elevated)',
        'surface-sidebar':  'var(--surface-sidebar)',
        'surface-header':   'var(--surface-header)',

        // ── Bordas ──
        'border-default': 'var(--border-default)',
        'border-subtle':  'var(--border-subtle)',
        'border-strong':  'var(--border-strong)',
        'border-focus':   'var(--color-border-focus)',

        // ── Status ──
        'status-success':    'var(--color-status-success)',
        'status-success-bg': 'var(--color-status-success-bg)',
        'status-warning':    'var(--color-status-warning)',
        'status-warning-bg': 'var(--color-status-warning-bg)',
        'status-error':      'var(--color-status-error)',
        'status-error-bg':   'var(--color-status-error-bg)',
        'status-info':       'var(--color-status-info)',
        'status-info-bg':    'var(--color-status-info-bg)',
        'status-pending':    'var(--color-status-pending)',
        'status-pending-bg': 'var(--color-status-pending-bg)',

        // ── Escala primary (Blue) ──
        primary: {
          50:  '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
      },

      fontFamily: {
        display: ['Outfit', 'sans-serif'],
        body:    ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },

      boxShadow: {
        'xs':             'var(--shadow-xs)',
        'sm':             'var(--shadow-sm)',
        'card':           'var(--shadow-card)',
        'card-hover':     'var(--shadow-card-hover)',
        'button-primary': 'var(--shadow-button-primary)',
        'button-accent':  'var(--shadow-button-accent)',
        'modal':          'var(--shadow-modal)',
        'sidebar':        'var(--shadow-sidebar)',
      },

      borderRadius: {
        'xs':   '2px',
        'sm':   '4px',
        'md':   '6px',
        'lg':   '8px',
        'xl':   '12px',
        '2xl':  '16px',
        'full': '9999px',
      },

      animation: {
        'fade-in':  'fade-in 200ms ease both',
        'slide-in': 'slide-in-left 200ms ease both',
        'scale-in': 'scale-in 200ms ease both',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
