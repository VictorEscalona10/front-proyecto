import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: true, // Esto le dice a Vite: "Deja pasar a cualquiera"
    host: true,         // Esto es lo mismo que el --host que pusimos antes
  }
  
})
