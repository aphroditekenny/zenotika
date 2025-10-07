// Debug wrapper to diagnose unexpected Vite dev server exit.
process.on('beforeExit', (code) => {
  console.log('[dev-debug] beforeExit code=', code);
});
process.on('exit', (code) => {
  console.log('[dev-debug] exit code=', code);
});
process.on('uncaughtException', (err) => {
  console.error('[dev-debug] uncaughtException', err);
});
process.on('unhandledRejection', (reason) => {
  console.error('[dev-debug] unhandledRejection', reason);
});

// Keep event loop alive so we can see if something triggers an early exit.
setInterval(() => {}, 60_000).unref();

import { createServer } from 'vite';

try {
  const server = await createServer();
  await server.listen();
  const info = server.resolvedUrls;
  console.log('[dev-debug] Vite server listening');
  if (info?.local?.length) {
    console.log('[dev-debug] Local URLs:', info.local.join(', '));
  }
  if (info?.network?.length) {
    console.log('[dev-debug] Network URLs:', info.network.join(', '));
  }
} catch (e) {
  console.error('[dev-debug] Failed to start Vite server', e);
  process.exitCode = 1;
}
