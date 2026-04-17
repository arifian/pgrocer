import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const src = path.join(root, 'data', 'cache');
const dst = path.join(root, 'web', 'public', 'data');

async function main() {
  await fs.mkdir(dst, { recursive: true });
  const files = await fs.readdir(src);
  const jsons = files.filter((f) => f.endsWith('.json'));
  if (jsons.length === 0) {
    console.error(`No cached recipes in ${src}. Run "npm run scrape -- <skill>" first.`);
    process.exit(1);
  }
  for (const f of jsons) {
    await fs.copyFile(path.join(src, f), path.join(dst, f));
    console.log(`synced ${f}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
