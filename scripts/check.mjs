import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const publishMode = process.argv.includes('--publish');
const problems = [];
const warnings = [];

const join = (relative) => path.join(root, relative);
const read = (relative) => fs.readFileSync(join(relative), 'utf8');
const exists = (relative) => fs.existsSync(join(relative));

function expect(condition, message) {
  if (!condition) problems.push(message);
}

const pkg = JSON.parse(read('package.json'));

for (const file of [
  'index.js',
  'client.js',
  'cordis.patch.yml',
  'icon.svg',
  'LICENSE',
  'README.md',
  'README.en.md',
  'locale/en.json',
  'locale/zh.json',
]) {
  expect(exists(file), `missing required file: ${file}`);
}

for (const locale of ['en', 'zh']) {
  try {
    const data = JSON.parse(read(`locale/${locale}.json`));
    expect(typeof data?.meta?.title === 'string' && data.meta.title !== '', `locale/${locale}.json: meta.title is required`);
    expect(typeof data?.meta?.description === 'string' && data.meta.description !== '', `locale/${locale}.json: meta.description is required`);
  } catch (error) {
    problems.push(`locale/${locale}.json: ${error.message}`);
  }
}

if (exists('icon.svg')) {
  const iconSize = fs.statSync(join('icon.svg')).size;
  expect(iconSize <= 256 * 1024, `icon.svg must be at most 256 KiB (found ${iconSize} bytes)`);
}

expect(pkg.private !== true || publishMode === false, 'package.json must not be private for a release');
expect(typeof pkg.version === 'string' && /^\d+\.\d+\.\d+(?:-[\w.-]+)?$/.test(pkg.version), 'package.json: version must be semver');
expect(pkg.dsh?.bundle?.patch === './cordis.patch.yml', 'package.json: dsh.bundle.patch must point at ./cordis.patch.yml');
expect(pkg.dsh?.client?.platform === 'web', 'package.json: dsh.client.platform must be "web"');
expect(Array.isArray(pkg.dsh?.client?.inject) && pkg.dsh.client.inject.length > 0, 'package.json: dsh.client.inject must list the Host packages it relies on');

if (exists('client.js')) {
  const client = read('client.js');
  expect(client.includes(`id: '${pkg.name}'`), `client.js: __ModuleLoader__ id must equal "${pkg.name}"`);
  expect(client.includes('conversation.content'), 'client.js: expected the Conversation factory to be used');
}

if (exists('cordis.patch.yml')) {
  const patch = read('cordis.patch.yml');
  expect(patch.includes(`name: '${pkg.name}'`), `cordis.patch.yml: inserted row must name "${pkg.name}"`);
}

for (const file of ['index.js', 'client.js']) {
  if (!exists(file)) continue;
  try {
    execFileSync(process.execPath, ['--check', join(file)], { stdio: 'pipe' });
  } catch (error) {
    const detail = error.stderr === undefined ? error.message : error.stderr.toString();
    problems.push(`${file}: syntax error\n${detail}`);
  }
}

if (publishMode) {
  const repository = pkg.repository?.url ?? '';
  expect(!repository.includes('your-github-user'), 'package.json: replace the placeholder repository/homepage/bugs with the real GitHub URLs before publishing');
  expect(pkg.private !== true, 'package.json: private packages cannot be published');
}

if (pkg.license !== 'MIT') warnings.push(`license is "${pkg.license}", expected "MIT"`);

if (warnings.length > 0) {
  for (const warning of warnings) console.warn(`warning: ${warning}`);
}

if (problems.length > 0) {
  for (const problem of problems) console.error(`error: ${problem}`);
  process.exit(1);
}

console.log(`ok: ${pkg.name}@${pkg.version}${publishMode ? ' (publish mode)' : ''}`);
