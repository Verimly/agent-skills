#!/usr/bin/env node
// Validates the skills and emits an index of them (the `.well-known/skills` layout).
//
//   node scripts/build.mjs                 validate, write dist/ (index.json + <skill>/...)
//   node scripts/build.mjs --check         validate only
//   node scripts/build.mjs --out <dir>     write the tree to <dir> instead of dist/
//
// dist/ uses the `.well-known/skills` format that `npx skills add <url>` reads (same as
// https://docs.stripe.com/.well-known/skills/index.json): { skills: [{ name, description, files[] }] }, each file
// at <base>/<name>/<file>. Distribution today is the GitHub repository; this keeps a website option open. No dependencies.
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const skillsDir = join(root, 'skills');
const args = process.argv.slice(2);
const checkOnly = args.includes('--check');
const outIndex = args.indexOf('--out');
const outDir = outIndex >= 0 ? resolve(process.cwd(), args[outIndex + 1]) : join(root, 'dist');

// The portable frontmatter fields of the Agent Skills format; nothing else is allowed.
const ALLOWED = new Set(['name', 'description', 'license', 'compatibility', 'metadata', 'allowed-tools']);
const NAME = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const MAX_BODY_LINES = 200;
const errors = [];
const fail = (skill, message) => errors.push(`${skill}: ${message}`);

/** Parses the YAML subset used in frontmatter: `key: value`, and one level of `key:` + indented `sub: value`. */
function parseFrontmatter(text, skill) {
  const match = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/.exec(text);
  if (!match) { fail(skill, 'SKILL.md has no frontmatter'); return { data: {}, body: text }; }
  const data = {};
  let current = null;
  for (const line of match[1].split('\n')) {
    if (!line.trim()) continue;
    const nested = /^\s+([A-Za-z0-9_-]+):\s*(.*)$/.exec(line);
    if (nested && current && typeof data[current] === 'object') { data[current][nested[1]] = unquote(nested[2]); continue; }
    const top = /^([A-Za-z0-9_-]+):\s*(.*)$/.exec(line);
    if (!top) { fail(skill, `cannot parse frontmatter line: ${line}`); continue; }
    current = top[1];
    data[current] = top[2] === '' ? {} : unquote(top[2]);
  }
  return { data, body: match[2] };
}
const unquote = (value) => value.replace(/^(['"])(.*)\1$/, '$2');

const skills = [];
for (const name of readdirSync(skillsDir).sort()) {
  const dir = join(skillsDir, name);
  if (!statSync(dir).isDirectory()) continue;
  const file = join(dir, 'SKILL.md');
  if (!existsSync(file)) { fail(name, 'missing SKILL.md'); continue; }
  const { data, body } = parseFrontmatter(readFileSync(file, 'utf8'), name);
  for (const key of Object.keys(data)) if (!ALLOWED.has(key)) fail(name, `frontmatter field "${key}" is not portable (allowed: ${[...ALLOWED].join(', ')})`);
  if (data.name !== name) fail(name, `frontmatter name "${data.name}" must match the folder`);
  if (!NAME.test(name) || name.length > 64) fail(name, 'name must be lowercase letters, digits and single hyphens, at most 64 characters');
  const description = typeof data.description === 'string' ? data.description : '';
  if (description.length < 40 || description.length > 1024) fail(name, `description must be 40 to 1024 characters (is ${description.length})`);
  if (!/\buse when\b/i.test(description)) fail(name, 'description should say when to use the skill ("Use when ...")');
  if (data.compatibility && String(data.compatibility).length > 500) fail(name, 'compatibility is over 500 characters');
  if (!data.license) fail(name, 'license is required');
  if (data.metadata && (typeof data.metadata !== 'object' || Object.values(data.metadata).some((value) => typeof value !== 'string'))) fail(name, 'metadata must be a map of strings');
  if (data['allowed-tools'] !== undefined && typeof data['allowed-tools'] !== 'string') fail(name, 'allowed-tools must be a space-separated string');
  const lines = body.replace(/\n+$/, '').split('\n').length;
  if (lines >= MAX_BODY_LINES) fail(name, `body has ${lines} lines (limit ${MAX_BODY_LINES - 1})`);
  // Every relative reference mentioned in the body must exist inside the skill.
  for (const ref of new Set([...body.matchAll(/`(references\/[A-Za-z0-9._-]+\.md)`/g)].map((m) => m[1]))) {
    if (!existsSync(join(dir, ref))) fail(name, `references ${ref}, which does not exist`);
  }
  const files = [];
  (function walk(folder) {
    for (const entry of readdirSync(folder, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const path = join(folder, entry.name);
      if (entry.isDirectory()) walk(path);
      else files.push(relative(dir, path).split('\\').join('/'));
    }
  })(dir);
  files.sort((a, b) => (a === 'SKILL.md' ? -1 : b === 'SKILL.md' ? 1 : a.localeCompare(b)));
  skills.push({ name, description, files, dir });
}
if (skills.length === 0) fail('skills', 'no skills found');

// Plugin manifests stay in sync with the package.
const readJson = (path) => JSON.parse(readFileSync(join(root, path), 'utf8'));
try {
  const plugin = readJson('.claude-plugin/plugin.json');
  const marketplace = readJson('.claude-plugin/marketplace.json');
  const pkg = readJson('package.json');
  const mcp = readJson('.mcp.json');
  if (plugin.name !== 'verimly') fail('plugin', 'plugin name must be "verimly"');
  if (plugin.version !== pkg.version) fail('plugin', `plugin.json version ${plugin.version} differs from package.json ${pkg.version}`);
  if (!marketplace.plugins?.some((entry) => entry.name === plugin.name)) fail('plugin', 'marketplace.json must list the plugin');
  if (!/^https:\/\/mcp\.verimly\.com\/mcp$/.test(mcp.mcpServers?.verimly?.url ?? '')) fail('plugin', '.mcp.json must point at https://mcp.verimly.com/mcp');
  for (const skill of skills) if (skill.name !== 'verimly' && !skill.name.startsWith('verimly-')) fail(skill.name, 'skill names must start with "verimly"');
} catch (error) {
  fail('plugin', `manifest problem: ${error.message}`);
}

if (errors.length) {
  console.error(`agent-skills: ${errors.length} problem(s)\n- ${errors.join('\n- ')}`);
  process.exit(1);
}
if (checkOnly) {
  console.log(`agent-skills: ${skills.length} skills valid (${skills.map((s) => s.name).join(', ')})`);
  process.exit(0);
}

rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });
for (const skill of skills) {
  for (const file of skill.files) {
    const target = join(outDir, skill.name, file);
    mkdirSync(dirname(target), { recursive: true });
    cpSync(join(skill.dir, file), target);
  }
}
const index = { skills: skills.map(({ name, description, files }) => ({ name, description, files })) };
writeFileSync(join(outDir, 'index.json'), `${JSON.stringify(index, null, 2)}\n`);
console.log(`agent-skills: wrote ${skills.length} skills to ${relative(process.cwd(), outDir) || '.'} (index.json + ${skills.reduce((n, s) => n + s.files.length, 0)} files)`);
