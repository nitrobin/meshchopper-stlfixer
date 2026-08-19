// Make the built CLI executable. No-op on Windows, where npm handles bin shims.
import { chmod } from 'node:fs/promises';

if (process.platform !== 'win32') {
  await chmod(new URL('../dist/cli.js', import.meta.url), 0o755);
}
