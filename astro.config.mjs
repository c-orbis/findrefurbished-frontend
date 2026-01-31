import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import vercel from '@astrojs/vercel/serverless'; // 1. De adapter import

export default defineConfig({
  integrations: [tailwind()],
  output: 'server',         // 2. FORCEER SERVER MODUS
  adapter: vercel(),        // 3. KOPPEL VERCEL
});
