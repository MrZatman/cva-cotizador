import type { Config } from 'tailwindcss'
const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        cva: {
          green: { DEFAULT: '#2D5A3D', dark: '#1E3D29', light: '#3D7A4D' },
          gray: { 100: '#F5F5F5', 200: '#EEEEEE', 300: '#E0E0E0', 400: '#BDBDBD', 500: '#9E9E9E', 600: '#757575', 700: '#616161', 800: '#424242', 900: '#212121' },
        },
      },
      fontFamily: { display: ['Playfair Display', 'serif'], sans: ['Inter', 'sans-serif'] },
    },
  },
  plugins: [],
}
export default config
