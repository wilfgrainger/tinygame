import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const roots = ['src', 'public', 'wrangler.jsonc', 'package.json'];
const forbidden = [
  [/\bR2Bucket\b/, 'R2 is excluded from V0.1'],
  [/\bDurableObject\b/, 'Durable Objects are excluded from V0.1'],
  [/\brojo\b/i, 'Rojo is Roblox-only'],
  [/\broblox\b/i, 'Roblox runtime references are excluded'],
  [/\bDevFlatGround\b/, 'the flat-ground development scaffold must not return'],
  [/debug[_-]?auth[_-]?bypass/i, 'production auth bypass is forbidden'],
  [/-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----/, 'private key material must never be committed']
];
const secretNames = [/^\.dev\.vars$/, /^\.env$/, /^\.env\.local$/];
const violations = [];

function files(path) {
  const s = statSync(path);
  if (s.isFile()) return [path];
  return readdirSync(path).flatMap((name) => files(join(path, name)));
}

for (const root of roots) {
  try {
    for (const file of files(root)) {
      const rel = relative('.', file);
      if (secretNames.some((pattern) => pattern.test(rel.split('/').at(-1) || ''))) violations.push(`${rel}: secret file name`);
      if (!/\.(ts|js|mjs|json|jsonc|html|css|webmanifest|txt)$/.test(file) && !file.endsWith('package.json')) continue;
      const text = readFileSync(file, 'utf8');
      for (const [pattern, reason] of forbidden) if (pattern.test(text)) violations.push(`${rel}: ${reason}`);
    }
  } catch (error) {
    if (root === 'wrangler.jsonc' && error?.code === 'ENOENT') continue;
    throw error;
  }
}

if (violations.length) {
  console.error(violations.join('\n'));
  process.exit(1);
}
console.log('source contract: PASS');
