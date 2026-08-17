import { readFileSync, writeFileSync } from 'node:fs';

const [environment, infoPath] = process.argv.slice(2);
if (!['dev', 'live'].includes(environment) || !infoPath) {
  throw new Error('usage: node scripts/configure-d1-env.mjs <dev|live> <d1-info.json>');
}

const info = JSON.parse(readFileSync(infoPath, 'utf8'));
const id = info.uuid || info.database_id || info.id;
if (typeof id !== 'string' || id.length < 8) throw new Error('D1 info did not contain a database ID');

const base = JSON.parse(readFileSync('wrangler.jsonc', 'utf8'));
const name = `tinygame-${environment}`;
const config = {
  $schema: base.$schema,
  name,
  main: base.main,
  compatibility_date: base.compatibility_date,
  assets: base.assets,
  d1_databases: [{
    binding: 'DB',
    database_name: name,
    database_id: id,
    migrations_dir: 'migrations'
  }],
  vars: { TINY_ENV: environment }
};

const file = `wrangler.${environment}.jsonc`;
writeFileSync(file, `${JSON.stringify(config, null, 2)}\n`);
console.log(`wrote ${file} for ${name} (${id})`);
