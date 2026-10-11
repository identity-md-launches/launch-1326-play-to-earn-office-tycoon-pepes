import { readFile, readdir, stat } from 'node:fs/promises';
import { dirname, resolve, join } from 'node:path';
import assert from 'node:assert/strict';

const root = resolve('dist');
const html = await readFile(join(root, 'index.html'), 'utf8');
const required = [
  '<title>',
  'name="description"',
  'property="og:title"',
  'property="og:image"',
  'rel="icon"',
];
for (const field of required) assert.ok(html.includes(field), `Missing metadata: ${field}`);
const references = [...html.matchAll(/(?:src|href)="([^"]+)"/g)].map((match) => [root, match[1]]);
references.push([root, html.match(/property="og:image" content="([^"]+)"/)[1]]);
let total = 0;
let files = 0;
async function walk(folder) {
  for (const entry of await readdir(folder, { withFileTypes: true })) {
    assert.ok(!entry.isSymbolicLink(), `Export must not contain a symlink: ${entry.name}`);
    const path = join(folder, entry.name);
    if (entry.isDirectory()) {
      assert.ok(
        !['node_modules', '.npm', '.cache', '.vite'].includes(entry.name),
        `Dependency/cache directory in export: ${path}`,
      );
      await walk(path);
    } else {
      files++;
      total += (await stat(path)).size;
      if (entry.name.endsWith('.css')) {
        const css = await readFile(path, 'utf8');
        for (const [, value] of css.matchAll(/url\(([^)]+)\)/g))
          references.push([dirname(path), value.replace(/["']/g, '')]);
      }
    }
  }
}
await walk(root);
for (const [base, url] of references) {
  if (url.startsWith('data:') || url.startsWith('#')) continue;
  assert.ok(!/^(?:https?:|\/)/.test(url), `Runtime asset must be local and relative: ${url}`);
  const path = resolve(base, decodeURIComponent(url.split('?')[0]));
  assert.ok(path.startsWith(root + '/'), `Asset escapes dist: ${url}`);
  assert.ok((await stat(path)).isFile(), `Missing asset: ${url}`);
}
assert.ok(total < 8_388_608, 'The export alone exceeds the complete submission budget.');
const image = await readFile(join(root, 'og-image.png'));
assert.equal(image.subarray(1, 4).toString(), 'PNG');
assert.equal(image.readUInt32BE(16), 1200);
assert.equal(image.readUInt32BE(20), 630);
console.log(
  `Export check passed: ${files} files, ${total.toLocaleString('en-US')} bytes, ${references.length} local asset references. Social image: 1200×630 PNG.`,
);
