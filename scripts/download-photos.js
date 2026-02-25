#!/usr/bin/env node
/**
 * Download selected photos from Google Drive for the website
 * Downloads to images/raw/ with standardized filenames
 */

const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const ENV_PATH = path.resolve(__dirname, '../../Porano/.env.local');
const RAW_DIR = path.resolve(__dirname, '../images/raw');

function loadCredentials() {
  const envContent = fs.readFileSync(ENV_PATH, 'utf-8');
  const match = envContent.match(/^GOOGLE_SERVICE_ACCOUNT_JSON=(.+)$/m);
  if (!match) throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON not found');
  return JSON.parse(match[1]);
}

async function getDriveClient() {
  const creds = loadCredentials();
  const auth = new google.auth.GoogleAuth({
    credentials: creds,
    scopes: ['https://www.googleapis.com/auth/drive.readonly'],
  });
  const authClient = await auth.getClient();
  return google.drive({ version: 'v3', auth: authClient });
}

async function downloadFile(drive, fileId, destPath) {
  const dir = path.dirname(destPath);
  fs.mkdirSync(dir, { recursive: true });

  const res = await drive.files.get(
    { fileId, alt: 'media', supportsAllDrives: true },
    { responseType: 'stream' }
  );

  const dest = fs.createWriteStream(destPath);
  await new Promise((resolve, reject) => {
    res.data.pipe(dest);
    res.data.on('end', resolve);
    res.data.on('error', reject);
  });

  const stat = fs.statSync(destPath);
  return (stat.size / 1024 / 1024).toFixed(1);
}

// Selected photos: { targetFilename: fileId }
const DOWNLOADS = {
  // === HERO B/A (歌舞伎GLOW) ===
  'hero-before.jpg': '1sGrLAiMB8n6t7CwbLpFaHKIT3ECTl0f0',  // GLOW before (0.4MB, good angle)
  'hero-after.jpg': '1-zSSjCdipRPfMUi8_oTt8QBiIbVEUPf8',   // GLOW after (0.4MB, best shot)

  // === OGP (歌舞伎SERENE - プロ撮影) ===
  'ogp-source.jpg': '19rwVaobLG39_30QpVjj9W-zR3CLwow50',    // SERENE edited (5.4MB)

  // === SERVICES ===
  'service-interior.jpg': '1k9DLK0hhtWiQ9ts3douUzakJmD7VbvW2',  // SERENE edited wide (6.5MB)
  'service-aircon.jpg': '1HLlSsSPbgkqzzrJsYbs9FGGhQUq3qBEn',   // 御成門オフィス - ceiling/AC visible (2.1MB)
  'service-electrical.jpg': '1gH3Ycrk0B7nqG5rK5RhoYRbK-riE9JSS', // GLOW after - lighting (0.2MB)
  'service-fire.jpg': '1pkW_wB2thZE_uEOoXxGtSyxcrIKP5T2r',      // 御成門オフィス - commercial space (2.2MB)

  // === PROJECT: GLOW (B/A) ===
  'glow-before.jpg': '1qfpl-kFVwp4JqFR66XxSaY4JXQYdHjE3', // GLOW before (0.4MB)
  'glow-after.jpg': '14Cck4_YLupeKIrV5T9TjJnFBOT_iPdHX',  // GLOW after (0.4MB)

  // === PROJECT: 千葉犬カフェ (B/A + gallery) ===
  'dogcafe-before.jpg': '1auvialUCd5BBEQt6Nm2B6KJC7UYC5E5G',  // before (0.3MB)
  'dogcafe-after.jpg': '1n3pyexqduXjIa0DQd1XdWfh86yUD4UGe',   // after 5185 (3.6MB)
  'dogcafe-gallery1.jpg': '1RBmg0DKeH9c2eRZoPM1vDOF6D9M7NC-x', // 5187 (2.8MB)
  'dogcafe-gallery2.jpg': '1frG2MxyWJM4azk-OviVYTmsTjlWSICkK',  // 5189 (4.0MB)

  // === PROJECT: 赤坂フレンズバーハウス (B/A + gallery) ===
  'friendsbar-before.jpg': '1jjUwocjRfkwFeg5wrLj_XGZbekq7aOPu', // before (0.4MB)
  'friendsbar-after.jpg': '1MxgzpPVFNSsPmZfVXHAX8-EHebtuZ853',  // after (0.3MB)
  'friendsbar-gallery1.jpg': '19-9DbTckol1kIUf9dOTdV7Lb9uzngy1B', // after (0.3MB)
  'friendsbar-gallery2.jpg': '1tpX8XQrwWLi6P797TQqKI5bKBZyAZmoL', // after (0.3MB)

  // === PROJECT: 歌舞伎SERENE (プロ撮影ギャラリー) ===
  'serene-1.jpg': '1xqbPySll6pVziI2FeT7C2AgCTxhvgjre',  // 001 entrance (4.4MB)
  'serene-2.jpg': '1-me4O_jqo5HhUpSUAjeusWipHOVaxswe',  // 035 wide angle (6.2MB)
  'serene-3.jpg': '1F8R-Tq93YQLhbmM8wcG1fqGKfjLOzDmH',  // 065 best shot (7.2MB)
  'serene-4.jpg': '1k9DLK0hhtWiQ9ts3douUzakJmD7VbvW2',  // edited (6.5MB)

  // === PROJECT: 御成門レンタルオフィス ===
  'office-1.jpg': '1HLlSsSPbgkqzzrJsYbs9FGGhQUq3qBEn',  // 4911 (2.1MB)
  'office-2.jpg': '1aHCyscDVhKz1_9sx1n4lDCzgEMj8-CLM',  // 4921 (2.1MB)
  'office-3.jpg': '1vk8ZoLA7nghCYIvOLsx2r2Fii3UZq1jC',  // 4930 (1.8MB)

  // === PROJECT: 楽園池袋GS ===
  'rakuen-1.jpg': '1nApV8ppeu_j3tP32aD1zmT61NUF0k0zg',  // (0.6MB)
  'rakuen-2.jpg': '1Gt8YN-8tRXZzRy9zh5qgrZdQQNDFogSH',  // (0.6MB)
  'rakuen-3.jpg': '1Oc49SGUxG535zAEFe38fP-bU9sPuXnFS',  // (0.6MB)

  // === PROJECT: 越谷焼肉屋 ===
  'yakiniku-1.jpg': '1haO8W5IsbcL5bh355KtUk9r8XUJ6Uv-G',  // (0.4MB)
  'yakiniku-2.jpg': '1tGP2Xu82AUQTzUofOc37EBdj7PFp1PxN',  // (0.4MB)
};

async function main() {
  console.log('\nDownloading photos from Google Drive\n====================================\n');
  fs.mkdirSync(RAW_DIR, { recursive: true });

  const drive = await getDriveClient();
  const entries = Object.entries(DOWNLOADS);
  let downloaded = 0;
  let totalMB = 0;

  for (const [filename, fileId] of entries) {
    const destPath = path.join(RAW_DIR, filename);
    if (fs.existsSync(destPath)) {
      const sizeMB = (fs.statSync(destPath).size / 1024 / 1024).toFixed(1);
      console.log(`  SKIP (exists): ${filename} (${sizeMB}MB)`);
      totalMB += parseFloat(sizeMB);
      downloaded++;
      continue;
    }

    try {
      const sizeMB = await downloadFile(drive, fileId, destPath);
      console.log(`  OK: ${filename} (${sizeMB}MB)`);
      totalMB += parseFloat(sizeMB);
      downloaded++;
    } catch (err) {
      console.error(`  FAIL: ${filename} - ${err.message}`);
    }
  }

  console.log(`\n====================================`);
  console.log(`Downloaded: ${downloaded}/${entries.length}`);
  console.log(`Total raw size: ${totalMB.toFixed(1)}MB`);
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
