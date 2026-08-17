import { readdirSync, statSync } from 'node:fs';
import { extname, join, relative } from 'node:path';

const MAX_FILE = 25 * 1024 * 1024;
const MAX_TOTAL = 20 * 1024 * 1024;
const totals = new Map();
let total = 0;
let failed = false;

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    const s = statSync(path);
    if (s.isDirectory()) walk(path);
    else {
      total += s.size;
      const ext = extname(path) || '(none)';
      totals.set(ext, (totals.get(ext) || 0) + s.size);
      if (s.size > MAX_FILE) {
        console.error(`asset exceeds 25 MiB: ${relative('dist', path)} (${s.size} bytes)`);
        failed = true;
      }
    }
  }
}

walk('dist');
for (const [ext, bytes] of [...totals.entries()].sort()) console.log(`${ext}: ${bytes} bytes`);
console.log(`dist total: ${total} bytes`);
if (total > MAX_TOTAL) {
  console.error(`dist exceeds first-control V0.1 budget of ${MAX_TOTAL} bytes`);
  failed = true;
}
if (failed) process.exit(1);
