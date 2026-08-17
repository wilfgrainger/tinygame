import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));

function gitSha() {
  if (process.env.GITHUB_SHA) return process.env.GITHUB_SHA;
  if (process.env.CF_PAGES_COMMIT_SHA) return process.env.CF_PAGES_COMMIT_SHA;
  try {
    return execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
  } catch {
    return 'local';
  }
}

const release = {
  version: pkg.version,
  commitSha: gitSha(),
  buildTime: new Date().toISOString(),
  environment: process.env.TINY_ENV || 'local'
};

const ts = `export const APP_VERSION = ${JSON.stringify(release.version)};\nexport const COMMIT_SHA = ${JSON.stringify(release.commitSha)};\nexport const BUILD_TIME = ${JSON.stringify(release.buildTime)};\nexport const TINY_ENV = ${JSON.stringify(release.environment)};\n\nexport type ReleaseMetadata = { version: string; commitSha: string; buildTime: string; environment: string };\nexport const RELEASE: ReleaseMetadata = { version: APP_VERSION, commitSha: COMMIT_SHA, buildTime: BUILD_TIME, environment: TINY_ENV };\n`;

for (const [path, content] of [
  ['src/generated/release.ts', ts],
  ['public/release.json', `${JSON.stringify(release, null, 2)}\n`]
]) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content);
}

console.log(`TinyWorld ${release.version} ${release.commitSha.slice(0, 12)} ${release.environment}`);
