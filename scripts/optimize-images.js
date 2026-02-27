#!/usr/bin/env node
/**
 * 画像最適化スクリプト
 * - 既存JPEG/PNG → WebP変換 + JPEG圧縮
 * - 大きい画像はリサイズ（横幅上限 1920px）
 * - 元ファイルは .original にバックアップ
 *
 * Usage: node scripts/optimize-images.js [--no-backup]
 */
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const PROJECTS_DIR = path.join(ROOT, "images", "projects");
const MAX_WIDTH = 1920;
const WEBP_QUALITY = 82;
const JPEG_QUALITY = 80;
const SKIP_DIRS = ["_candidates"];
const SIZE_THRESHOLD = 200 * 1024; // Only optimize files > 200KB
const NO_BACKUP = process.argv.includes("--no-backup");

async function findImages(dir) {
  const results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (SKIP_DIRS.includes(entry.name)) continue;
      results.push(...(await findImages(fullPath)));
    } else if (/\.(jpg|jpeg|png)$/i.test(entry.name)) {
      results.push(fullPath);
    }
  }
  return results;
}

async function optimizeImage(filePath) {
  const baseName = filePath.replace(/\.(jpg|jpeg|png)$/i, "");
  const webpPath = baseName + ".webp";
  const originalSize = fs.statSync(filePath).size;

  // Skip small files
  if (originalSize < SIZE_THRESHOLD) {
    const relPath = path.relative(PROJECTS_DIR, filePath);
    console.log(`  SKIP (${(originalSize / 1024).toFixed(0)}KB < 200KB): ${relPath}`);
    // Still generate WebP for small files
    const metadata = await sharp(filePath).metadata();
    await sharp(filePath)
      .resize(MAX_WIDTH, null, { withoutEnlargement: true })
      .webp({ quality: WEBP_QUALITY })
      .toFile(webpPath);
    const webpSize = fs.statSync(webpPath).size;
    return { relPath, originalSize, webpSize, jpgSize: originalSize, resized: false, skippedJpg: true };
  }

  const metadata = await sharp(filePath).metadata();
  const needsResize = metadata.width > MAX_WIDTH;

  let pipeline = sharp(filePath);
  if (needsResize) {
    pipeline = pipeline.resize(MAX_WIDTH, null, { withoutEnlargement: true });
  }

  // Generate WebP
  await pipeline.clone().webp({ quality: WEBP_QUALITY }).toFile(webpPath);
  const webpSize = fs.statSync(webpPath).size;

  // Generate compressed JPEG
  const tempJpg = filePath + ".tmp";
  await pipeline.clone().jpeg({ quality: JPEG_QUALITY, mozjpeg: true }).toFile(tempJpg);
  const jpgSize = fs.statSync(tempJpg).size;

  // Backup original and replace
  if (jpgSize < originalSize) {
    if (!NO_BACKUP) {
      fs.renameSync(filePath, filePath + ".original");
    }
    fs.renameSync(tempJpg, filePath);
  } else {
    fs.unlinkSync(tempJpg);
  }

  const finalJpgSize = fs.statSync(filePath).size;
  const relPath = path.relative(PROJECTS_DIR, filePath);
  const savings = ((1 - webpSize / originalSize) * 100).toFixed(1);

  console.log(
    `  ${relPath}: ${(originalSize / 1024).toFixed(0)}KB → WebP ${(webpSize / 1024).toFixed(0)}KB (-${savings}%)` +
      (needsResize ? ` [${metadata.width}→${MAX_WIDTH}px]` : "") +
      (finalJpgSize < originalSize ? ` | JPG ${(finalJpgSize / 1024).toFixed(0)}KB` : "")
  );

  return { relPath, originalSize, webpSize, jpgSize: finalJpgSize, resized: needsResize };
}

async function main() {
  console.log("=== Poranoplaza 画像最適化 ===\n");

  if (!fs.existsSync(PROJECTS_DIR)) {
    console.error(`ディレクトリが見つかりません: ${PROJECTS_DIR}`);
    process.exit(1);
  }

  const images = await findImages(PROJECTS_DIR);
  console.log(`対象画像: ${images.length}枚\n`);

  let totalOriginal = 0;
  let totalWebp = 0;
  let count = 0;

  for (const img of images) {
    const result = await optimizeImage(img);
    if (result) {
      totalOriginal += result.originalSize;
      totalWebp += result.webpSize;
      count++;
    }
  }

  console.log(`\n=== 完了 ===`);
  console.log(`変換: ${count}枚`);
  console.log(`元合計: ${(totalOriginal / 1024 / 1024).toFixed(1)}MB`);
  console.log(`WebP合計: ${(totalWebp / 1024 / 1024).toFixed(1)}MB`);
  if (totalOriginal > 0) {
    console.log(`削減率: ${((1 - totalWebp / totalOriginal) * 100).toFixed(1)}%`);
  }
  if (!NO_BACKUP) {
    console.log(`\n元画像は .original ファイルとしてバックアップ済み`);
    console.log(`確認後: find images/projects -name "*.original" -delete で削除可能`);
  }
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
