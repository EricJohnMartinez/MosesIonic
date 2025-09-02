module.exports = {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      spacing: {
        'safe': 'env(safe-area-inset-bottom)',
      },
      minHeight: {
        'screen-safe': 'calc(100vh - env(safe-area-inset-bottom))',
        'dvh': '100dvh',
      },
      screens: {
        'xs': '475px',
      },
      fontSize: {
        'xxs': ['0.625rem', { lineHeight: '0.75rem' }],
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'pulse-slow': 'pulse 3s infinite',
      },
      transitionProperty: {
        'height': 'height',
        'spacing': 'margin, padding',
      },
      backdropBlur: {
        'xs': '2px',
      },
    },
  },
  plugins: [],
  // Add safelist for dynamic classes that might be purged
  safelist: [
    'touch-manipulation',
    'pb-safe',
    'min-h-screen-safe',
    'min-h-dvh',
  ]
};
