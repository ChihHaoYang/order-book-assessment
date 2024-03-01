import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      textColor: {
        default: '#F0F4F8',
        'quote-head': '#8698aa',
        'quote-buy': '#00b15d',
        'quote-sell': '#ff5b5a',
        'last-p-same': '#f0f4f8',
        'last-p-high': '#00b15d',
        'last-p-low': '#ff5b5a'
      },
      backgroundColor: {
        book: '#131B29',
        'last-p-same': 'rgba(134, 152, 170, 0.12)',
        'last-p-high': 'rgba(16, 186, 104, 0.12)',
        'last-p-low': 'rgba(255, 90, 90, 0.12)',
        'book-hover': 'rgba(255, 255, 255, 0.12)',
        'bar-buy': 'rgba(16, 186, 104, 0.12)',
        'bar-sell': 'rgba(255, 90, 90, 0.12)'
      },
      fill: {
        'last-p-same': '#f0f4f8',
        'last-p-high': '#00b15d',
        'last-p-low': '#ff5b5a'
      },
      stroke: {
        'last-p-same': '#f0f4f8',
        'last-p-high': '#00b15d',
        'last-p-low': '#ff5b5a'
      },
      keyframes: {
        greenFlash: {
          '0%': { backgroundColor: 'rgba(0, 177, 93, 0.5)' },
          '100%': { backgroundColor: 'none' }
        },
        redFlash: {
          '0%': { backgroundColor: 'rgba(255, 91, 90, 0.5)' },
          '100%': { backgroundColor: 'none' }
        }
      },
      animation: {
        'green-flash': 'greenFlash 0.5s linear 0s 1',
        'red-flash': 'redFlash 0.5s linear 0s 1'
      }
    }
  },
  plugins: []
};
export default config;
