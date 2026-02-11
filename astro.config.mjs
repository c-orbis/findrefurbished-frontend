import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  integrations: [tailwind()],
  // 'hybrid' is beter voor je affiliate site: statisch waar mogelijk, SSR voor live prijzen
  output: 'server', 
  adapter: cloudflare({
    mode: 'directory'
  }),
  image: {
    domains: ['img.findrefurbished.com'],
    remotePatterns: [{ protocol: 'https', hostname: 'img.findrefurbished.com' }],
  },
});
