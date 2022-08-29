/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,scss,ts}"],
  theme: {
    fontFamily: {
      sans: ['Space Mono', 'monospace']
    },
    fontWeight: {
      light: 300,
      regular: 400,
      bold: 700
    },
    fontSize: {
      micro: ['0.5rem', '1'],
      xxs: ['0.75rem', '1.15'],
      xs: ['1rem', '1.25'],
      base: ['1.15rem', '1.3'],
      s: ['1.65rem', '1.3'],
      m: ['2rem', '1.3'],
      l: ['2.5rem', '1.16'],
      xl: ['3.5rem', '1.16'],
      xxl: ['5rem', '1.16']
    },
    container: {
      center: true,
      padding: '1.875rem'
    },
    extend: {
      colors: {
        sepia: {
          lighter: '#EAE0C9',
          DEFAULT: '#B8A88A',
          darker: '#433422'
        },
        navy: {
          DEFAULT: '#3F5277'
        },
        success: {
          DEFAULT: '#1a912c'
        },
        red: {
          error: '#a61212',
          DEFAULT: 'red'
        },
        yellow: {
          DEFAULT:'yellow',
          warning: '#D4AE04'
        }
      },
      // height: {
      //   screen: 'calc(var(--vh, 1vh) * 100)'
      // },
      zIndex: {
        'null': -1
      }
    }
  },
  plugins: []
}
