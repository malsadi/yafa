import { cloudflare } from '@cloudflare/vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// One Worker serves the API and the single-page app (brief section 4). The
// Cloudflare environment is chosen at build time with CLOUDFLARE_ENV
// (T-066) — `wrangler deploy --env` cannot retarget a Vite build.
export default defineConfig({
  plugins: [react(), tailwindcss(), cloudflare()],
});
