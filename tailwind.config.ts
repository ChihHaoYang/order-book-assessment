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
        'book-hover': 'rgba(255, 255, 255, 0.12)'
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
      }
    }
  },
  plugins: []
};
export default config;
