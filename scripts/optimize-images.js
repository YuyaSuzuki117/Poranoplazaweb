#!/usr/bin/env node
/**
 * Image optimization script
 * Converts raw images from Google Drive to optimized WebP + JPG
 *
 * Usage:
 *   node scripts/optimize-images.js
 *
 * Reads from images/raw/ and outputs to appropriate directories.
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const RAW_DIR = path.join(ROOT, 'images/raw');

// Image processing configs
const CONFIGS = {
  hero: {
    width: 1920,
    quality: 80,
    dest: 'images/hero',
  },
  ogp: {
    width: 1200,
    height: 630,
    quality: 85,
    dest: 'images/hero',
    fit: 'cover',
  },
  portfolio: {
    width: 1200,
    quality: 80,
    dest: null, // set per-file
  },
  service: {
    width: 1200,
    quality: 80,
    dest: 'images/services',
  },
};

// File mapping: raw filename -> { config, outputName, dest? }
const FILE_MAP = {
  // Hero B/A
  'hero-before.jpg': { config: 'hero', outputName: 'before.jpg' },
  'hero-after.jpg': { config: 'hero', outputName: 'after.jpg' },

  // OGP
  'ogp-source.jpg': { config: 'ogp', outputName: 'og-image.jpg' },

  // Services
  'service-interior.jpg': { config: 'service', outputName: 'interior.jpg' },
  'service-aircon.jpg': { config: 'service', outputName: 'aircon.jpg' },
  'service-electrical.jpg': { config: 'service', outputName: 'electrical.jpg' },
  'service-fire.jpg': { config: 'service', outputName: 'fire.jpg' },

  // Projects - Glow
  'glow-before.jpg': { config: 'portfolio', outputName: 'before.jpg', dest: 'images/projects/glow' },
  'glow-after.jpg': { config: 'portfolio', outputName: 'after.jpg', dest: 'images/projects/glow' },

  // Projects - Dog Cafe
  'dogcafe-before.jpg': { config: 'portfolio', outputName: 'before.jpg', dest: 'images/projects/dog-cafe' },
  'dogcafe-after.jpg': { config: 'portfolio', outputName: 'after.jpg', dest: 'images/projects/dog-cafe' },
  'dogcafe-gallery1.jpg': { config: 'portfolio', outputName: 'gallery1.jpg', dest: 'images/projects/dog-cafe' },
  'dogcafe-gallery2.jpg': { config: 'portfolio', outputName: 'gallery2.jpg', dest: 'images/projects/dog-cafe' },

  // Projects - Friends Bar
  'friendsbar-before.jpg': { config: 'portfolio', outputName: 'before.jpg', dest: 'images/projects/friends-bar' },
  'friendsbar-after.jpg': { config: 'portfolio', outputName: 'after.jpg', dest: 'images/projects/friends-bar' },
  'friendsbar-gallery1.jpg': { config: 'portfolio', outputName: 'gallery1.jpg', dest: 'images/projects/friends-bar' },
  'friendsbar-gallery2.jpg': { config: 'portfolio', outputName: 'gallery2.jpg', dest: 'images/projects/friends-bar' },

  // Projects - Serene
  'serene-1.jpg': { config: 'portfolio', outputName: 'photo1.jpg', dest: 'images/projects/serene' },
  'serene-2.jpg': { config: 'portfolio', outputName: 'photo2.jpg', dest: 'images/projects/serene' },
  'serene-3.jpg': { config: 'portfolio', outputName: 'photo3.jpg', dest: 'images/projects/serene' },
  'serene-4.jpg': { config: 'portfolio', outputName: 'photo4.jpg', dest: 'images/projects/serene' },

  // Projects - Office
  'office-1.jpg': { config: 'portfolio', outputName: 'photo1.jpg', dest: 'images/projects/office' },
  'office-2.jpg': { config: 'portfolio', outputName: 'photo2.jpg', dest: 'images/projects/office' },
  'office-3.jpg': { config: 'portfolio', outputName: 'photo3.jpg', dest: 'images/projects/office' },

  // Projects - Rakuen
  'rakuen-1.jpg': { config: 'portfolio', outputName: 'photo1.jpg', dest: 'images/projects/rakuen' },
  'rakuen-2.jpg': { config: 'portfolio', outputName: 'photo2.jpg', dest: 'images/projects/rakuen' },
  'rakuen-3.jpg': { config: 'portfolio', outputName: 'photo3.jpg', dest: 'images/projects/rakuen' },

  // Projects - Yakiniku
  'yakiniku-1.jpg': { config: 'portfolio', outputName: 'photo1.jpg', dest: 'images/projects/yakiniku' },
  'yakiniku-2.jpg': { config: 'portfolio', outputName: 'photo2.jpg', dest: 'images/projects/yakiniku' },
};

async function processImage(rawName, mapping) {
  const rawPath = path.join(RAW_DIR, rawName);
  if (!fs.existsSync(rawPath)) {
    console.log(`  SKIP: ${rawName} (not found)`);
    return;
  }

  const cfg = CONFIGS[mapping.config];
  const destDir = path.join(ROOT, mapping.dest || cfg.dest);
  fs.mkdirSync(destDir, { recursive: true });

  const destPath = path.join(destDir, mapping.outputName);

  let pipeline = sharp(rawPath);

  if (cfg.fit === 'cover' && cfg.height) {
    pipeline = pipeline.resize(cfg.width, cfg.height, { fit: 'cover', position: 'center' });
  } else {
    pipeline = pipeline.resize(cfg.width, null, { withoutEnlargement: true });
  }

  await pipeline
    .jpeg({ quality: cfg.quality, mozjpeg: true })
    .toFile(destPath);

  const stat = fs.statSync(destPath);
  const sizeKB = (stat.size / 1024).toFixed(0);
  console.log(`  OK: ${rawName} -> ${path.relative(ROOT, destPath)} (${sizeKB}KB)`);
}

async function main() {
  console.log('\nImage Optimization\n==================\n');

  if (!fs.existsSync(RAW_DIR)) {
    console.error(`Raw directory not found: ${RAW_DIR}`);
    console.error('Run the download step first.');
    process.exit(1);
  }

  const rawFiles = fs.readdirSync(RAW_DIR);
  console.log(`Found ${rawFiles.length} files in raw/\n`);

  let processed = 0;
  let skipped = 0;

  for (const [rawName, mapping] of Object.entries(FILE_MAP)) {
    if (fs.existsSync(path.join(RAW_DIR, rawName))) {
      await processImage(rawName, mapping);
      processed++;
    } else {
      skipped++;
    }
  }

  // Summary
  console.log(`\n==================`);
  console.log(`Processed: ${processed}, Skipped: ${skipped}`);

  // Total output size
  let totalSize = 0;
  const countFiles = (dir) => {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        countFiles(full);
      } else if (entry.name.endsWith('.jpg') || entry.name.endsWith('.webp')) {
        totalSize += fs.statSync(full).size;
      }
    }
  };
  countFiles(path.join(ROOT, 'images'));
  console.log(`Total images size: ${(totalSize / 1024 / 1024).toFixed(1)}MB`);
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
