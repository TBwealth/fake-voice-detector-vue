/** @type {import('tailwindcss').Config} */
import flowbitePlugin from 'flowbite/plugin';

export default {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}", "./node_modules/flowbite/**/*.{js,,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {    
        transparent: 'transparent',
        current: 'currentColor',
        primary: '#FF914D',
        secondary:'#FFB401',
        bgDark: "#0F1014",
        lightDark:"#2A2C38",   
      },
      fontFamily: {
        sans: ["Avenir Next", "Manrope", 'Inter', 'Arial']
      }
    },
  },
  plugins: [   
    flowbitePlugin,
  ],
}

