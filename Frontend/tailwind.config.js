export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        whatsapp: {
          bg: '#111b21',
          panel: '#202c33',
          hover: '#2a3942',
          active: '#2a3942',
          border: '#2a3942',
          green: '#00a884',
          userMsg: '#005c4b',
          text: '#e9edef',
          subtext: '#8696a0',
          orange: '#ff6b35',
          yellow: '#f7c948',
        }
      }
    },
  },
  plugins: [],
}
