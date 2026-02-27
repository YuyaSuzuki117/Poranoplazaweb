/**
 * Generate small (640w) variants of images for srcset
 * Only for images >= 1200px wide
 */
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const SMALL_WIDTH = 640;
const dirs = ['images/projects', 'images/services'];

async function generate() {
  let count = 0;

  const walk = (d) => {
    const items = fs.readdirSync(d);
    const files = [];
    for (const item of items) {
      const fp = path.join(d, item);
      const st = fs.statSync(fp);
      if (st.isDirectory() && item !== '_candidates') files.push(...walk(fp));
      else if (item.endsWith('.webp') && !item.includes('-640w')) files.push(fp);
    }
    return files;
  };

  const allFiles = [];
  for (const dir of dirs) {
    if (fs.existsSync(dir)) allFiles.push(...walk(dir));
  }

  for (const fp of allFiles) {
    try {
      const meta = await sharp(fp).metadata();
      if (meta.width < 1200) continue;

      // Generate 640w variant
      const ext = path.extname(fp);
      const base = fp.slice(0, -ext.length);
      const smallPath = base + '-640w' + ext;

      if (fs.existsSync(smallPath)) {
        console.log(`SKIP ${smallPath} (exists)`);
        continue;
      }

      await sharp(fp)
        .resize(SMALL_WIDTH, null, { withoutEnlargement: true })
        .webp({ quality: 78 })
        .toFile(smallPath);

      const smallSize = Math.round(fs.statSync(smallPath).size / 1024);
      console.log(`OK ${fp} -> ${path.basename(smallPath)} (${smallSize}KB)`);
      count++;
    } catch (e) {
      console.error(`ERR ${fp}: ${e.message}`);
    }
  }

  console.log(`\nDone: ${count} variants generated`);
}

generate();
