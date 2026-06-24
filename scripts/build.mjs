import { cpSync, existsSync, mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';

const root = resolve(process.cwd());
const require = createRequire(import.meta.url);
const nextBin = require.resolve('next/dist/bin/next');
const standaloneDir = join(root, '.next', 'standalone');
const standaloneNextDir = join(standaloneDir, '.next');
const publicDir = join(root, 'public');
const staticDir = join(root, '.next', 'static');

execFileSync(process.execPath, [nextBin, 'build', '--webpack'], { stdio: 'inherit' });

mkdirSync(standaloneDir, { recursive: true });
mkdirSync(standaloneNextDir, { recursive: true });

if (existsSync(staticDir)) {
  cpSync(staticDir, join(standaloneNextDir, 'static'), { recursive: true });
}

if (existsSync(publicDir)) {
  cpSync(publicDir, join(standaloneDir, 'public'), { recursive: true });
}
