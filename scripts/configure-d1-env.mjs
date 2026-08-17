import { readFileSync, writeFileSync } from 'node:fs';

const [environment, infoPath] = process.argv.slice(2);
if (!environment || !infoPath) throw new Error('usage: node scripts/configure-d1-env.mjs <dev|live> <d1-info.json>');
const info = JSON.parse(readFileSync(infoPath, 'utf8'));
const id = info.uuid || info.database_id || info.id;
if (typeof id !== 'string' || id.length < 8) throw new Error('D1 info did not contain a database ID');
const name = `tinygame-${environment}`;
const file = `wrangler.${environment}.json`;
writeFileSync(file, `${JSON.stringify({ name, environment, database_id: id }, null, 2)}\n`);
console.log(`${environment} D1: ${name} ${id}`);
