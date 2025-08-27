#!/usr/bin/env node
/* Start Vite dev server programmatically and open an ngrok tunnel to it.
   This avoids platform spawn issues on Windows.

   Usage: node ./scripts/dev-ngrok.js
*/
import ngrok from 'ngrok';
import { createServer } from 'vite';

const VITE_PORT = Number(process.env.VITE_PORT || 5173);

async function startVite() {
  const server = await createServer({
    server: {
      port: VITE_PORT,
      strictPort: true,
      host: true,
    },
  });

  await server.listen();
  const info = server.config.server;
  // Vite dev server running on port
  return server;
}

(async () => {
  // Starting Vite dev server (in-process)

  let viteServer;
  try {
    viteServer = await startVite();
  } catch (err) {
    console.error('Failed to start Vite server:', err);
    process.exit(1);
  }

  // Vite started. Opening ngrok tunnel

  let url;
  try {
    url = await ngrok.connect({ addr: VITE_PORT });
  // ngrok public URL: available
  // Press Ctrl+C to stop.
  } catch (err) {
    console.error('Failed to start ngrok:', err);
    try {
      await viteServer.close();
    } catch (_) {}
    process.exit(1);
  }

  async function shutdown() {
  // Shutting down...
    try {
      await ngrok.disconnect();
      await ngrok.kill();
    } catch (_) {}
    try {
      await viteServer.close();
    } catch (_) {}
    process.exit(0);
  }

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
})();
