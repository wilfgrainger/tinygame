import { mkdirSync } from 'node:fs';
import { spawn, spawnSync } from 'node:child_process';

const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx';
mkdirSync('dist', { recursive: true });

const migration = spawnSync(npx, ['wrangler', 'd1', 'migrations', 'apply', 'tinygame-local', '--local'], { stdio: 'inherit' });
if (migration.status !== 0) process.exit(migration.status ?? 1);

const children = [
  spawn(npx, ['wrangler', 'dev', '--local', '--port', '8787'], { stdio: 'inherit' }),
  spawn(npx, ['vite'], { stdio: 'inherit' })
];

let stopping = false;
function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  for (const child of children) if (!child.killed) child.kill('SIGTERM');
  setTimeout(() => process.exit(code), 100).unref();
}

for (const child of children) {
  child.on('exit', (code, signal) => {
    if (!stopping && (code !== 0 || signal)) stop(code ?? 1);
  });
  child.on('error', () => stop(1));
}

process.on('SIGINT', () => stop(0));
process.on('SIGTERM', () => stop(0));
