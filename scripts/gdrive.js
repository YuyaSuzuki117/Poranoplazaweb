#!/usr/bin/env node
/**
 * Google Drive HP素材アクセスツール
 *
 * Usage:
 *   node scripts/gdrive.js list [folderId]        - フォルダ内のファイル一覧
 *   node scripts/gdrive.js tree [folderId] [depth] - ツリー表示
 *   node scripts/gdrive.js download <fileId> [dest] - ファイルダウンロード
 *   node scripts/gdrive.js download-folder <folderId> [dest] - フォルダ一括DL
 *   node scripts/gdrive.js search <query>          - ファイル名検索
 *   node scripts/gdrive.js trash <fileId>          - ゴミ箱に移動
 *   node scripts/gdrive.js dedup [folderId]        - 重複フォルダ検出・整理
 *   node scripts/gdrive.js dedup [folderId] --exec - 重複フォルダを実際にゴミ箱へ
 */

const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

// --- Config ---
const ENV_PATH = path.resolve(__dirname, '../../Porano/.env.local');
const HP_FOLDER_ID = '1_2fp9XTuP1lJXLQ_YYMPPE300qwKyWPK';
const DEFAULT_DOWNLOAD_DIR = path.resolve(__dirname, '../images');

// --- Load credentials ---
function loadCredentials() {
  const envContent = fs.readFileSync(ENV_PATH, 'utf-8');
  const match = envContent.match(/^GOOGLE_SERVICE_ACCOUNT_JSON=(.+)$/m);
  if (!match) throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON not found in .env.local');
  return JSON.parse(match[1]);
}

// --- Auth ---
async function getAuthClient() {
  const creds = loadCredentials();
  const auth = new google.auth.GoogleAuth({
    credentials: creds,
    scopes: ['https://www.googleapis.com/auth/drive'],
  });
  return auth.getClient();
}

async function getDriveClient() {
  const authClient = await getAuthClient();
  return google.drive({ version: 'v3', auth: authClient });
}

// --- List files in folder ---
async function listFiles(folderId = HP_FOLDER_ID) {
  const drive = await getDriveClient();
  const files = [];
  let pageToken;

  do {
    const res = await drive.files.list({
      q: `'${folderId}' in parents and trashed = false`,
      fields: 'nextPageToken, files(id, name, mimeType, size, modifiedTime)',
      orderBy: 'name',
      pageSize: 100,
      pageToken,
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    });
    files.push(...res.data.files);
    pageToken = res.data.nextPageToken;
  } while (pageToken);

  return files;
}

// --- Tree view ---
async function printTree(folderId = HP_FOLDER_ID, depth = 2, indent = '') {
  const files = await listFiles(folderId);
  const folders = files.filter(f => f.mimeType === 'application/vnd.google-apps.folder');
  const nonFolders = files.filter(f => f.mimeType !== 'application/vnd.google-apps.folder');

  for (const folder of folders) {
    const fileCount = depth > 1 ? '' : '';
    console.log(`${indent}📁 ${folder.name}  [${folder.id}]`);
    if (depth > 1) {
      await printTree(folder.id, depth - 1, indent + '  ');
    }
  }
  for (const file of nonFolders) {
    const size = file.size ? `${(parseInt(file.size) / 1024 / 1024).toFixed(1)}MB` : '';
    console.log(`${indent}📄 ${file.name}  ${size}  [${file.id}]`);
  }
}

// --- Download single file ---
async function downloadFile(fileId, destDir = DEFAULT_DOWNLOAD_DIR) {
  const drive = await getDriveClient();

  // Get file metadata
  const meta = await drive.files.get({
    fileId,
    fields: 'id, name, mimeType, size',
    supportsAllDrives: true,
  });

  const fileName = meta.data.name;
  const destPath = path.join(destDir, fileName);

  // Ensure directory exists
  fs.mkdirSync(destDir, { recursive: true });

  // Download
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

  const sizeMB = meta.data.size ? `${(parseInt(meta.data.size) / 1024 / 1024).toFixed(1)}MB` : '';
  console.log(`Downloaded: ${fileName} ${sizeMB} -> ${destPath}`);
  return destPath;
}

// --- Download entire folder ---
async function downloadFolder(folderId, destDir = DEFAULT_DOWNLOAD_DIR) {
  const drive = await getDriveClient();
  const files = await listFiles(folderId);

  // Get folder name for subdirectory
  const folderMeta = await drive.files.get({
    fileId: folderId,
    fields: 'name',
    supportsAllDrives: true,
  });
  const folderPath = path.join(destDir, folderMeta.data.name);
  fs.mkdirSync(folderPath, { recursive: true });

  let downloaded = 0;
  for (const file of files) {
    if (file.mimeType === 'application/vnd.google-apps.folder') {
      // Recurse into subfolders
      await downloadFolder(file.id, folderPath);
    } else {
      await downloadFile(file.id, folderPath);
      downloaded++;
    }
  }
  console.log(`\nFolder "${folderMeta.data.name}": ${downloaded} files downloaded to ${folderPath}`);
}

// --- Search files ---
async function searchFiles(query, folderId = HP_FOLDER_ID) {
  const drive = await getDriveClient();
  const files = [];
  let pageToken;

  do {
    const res = await drive.files.list({
      q: `name contains '${query.replace(/'/g, "\\'")}' and '${folderId}' in parents and trashed = false`,
      fields: 'nextPageToken, files(id, name, mimeType, size, parents)',
      pageSize: 100,
      pageToken,
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    });
    files.push(...res.data.files);
    pageToken = res.data.nextPageToken;
  } while (pageToken);

  // Also search in subfolders
  const subfolders = await listFiles(folderId);
  for (const folder of subfolders.filter(f => f.mimeType === 'application/vnd.google-apps.folder')) {
    const subResults = await searchFiles(query, folder.id);
    files.push(...subResults);
  }

  return files;
}

// --- Trash (move to trash, recoverable) ---
async function trashFile(fileId) {
  const drive = await getDriveClient();
  const meta = await drive.files.get({
    fileId,
    fields: 'id, name, mimeType',
    supportsAllDrives: true,
  });
  await drive.files.update({
    fileId,
    requestBody: { trashed: true },
    supportsAllDrives: true,
  });
  const type = meta.data.mimeType === 'application/vnd.google-apps.folder' ? '📁' : '📄';
  console.log(`🗑️  Trashed: ${type} ${meta.data.name} [${fileId}]`);
}

// --- Count files recursively ---
async function countFilesRecursive(folderId) {
  const files = await listFiles(folderId);
  let count = 0;
  const names = [];
  for (const f of files) {
    if (f.mimeType === 'application/vnd.google-apps.folder') {
      const sub = await countFilesRecursive(f.id);
      count += sub.count;
      names.push(...sub.names);
    } else {
      count++;
      names.push(f.name + ':' + (f.size || '0'));
    }
  }
  return { count, names };
}

// --- Dedup: find and trash duplicate folders ---
async function dedup(folderId = HP_FOLDER_ID, exec = false) {
  const files = await listFiles(folderId);
  const folders = files.filter(f => f.mimeType === 'application/vnd.google-apps.folder');

  // Group by name
  const groups = {};
  for (const f of folders) {
    if (!groups[f.name]) groups[f.name] = [];
    groups[f.name].push(f);
  }

  const dupes = Object.entries(groups).filter(([, v]) => v.length > 1);
  if (dupes.length === 0) {
    console.log('\n✅ 重複フォルダなし');
    return;
  }

  console.log(`\n🔍 ${dupes.length} 組の重複フォルダを検出\n`);

  let totalTrashed = 0;
  for (const [name, items] of dupes) {
    console.log(`── ${name} (${items.length}個) ──`);

    // Count files in each
    const counts = [];
    for (const item of items) {
      const info = await countFilesRecursive(item.id);
      counts.push({ ...item, fileCount: info.count, fingerprint: info.names.sort().join('|') });
    }

    // Sort: most files first
    counts.sort((a, b) => b.fileCount - a.fileCount);

    const keep = counts[0];
    const toTrash = counts.slice(1);

    console.log(`  ✅ 保持: [${keep.id.slice(0, 8)}...] ${keep.fileCount}件`);
    for (const t of toTrash) {
      const identical = t.fingerprint === keep.fingerprint;
      const subset = !identical && t.fileCount <= keep.fileCount;
      const tag = identical ? '完全一致' : subset ? 'サブセット' : `${t.fileCount}件`;
      console.log(`  🗑️  削除: [${t.id.slice(0, 8)}...] ${t.fileCount}件 (${tag})`);
      if (exec) {
        await trashFile(t.id);
        totalTrashed++;
      }
    }
    console.log('');
  }

  if (!exec) {
    console.log(`\n⚠️  ドライラン: 実行するには --exec を付けてください`);
    console.log(`   node scripts/gdrive.js dedup ${folderId} --exec`);
  } else {
    console.log(`\n✅ ${totalTrashed} フォルダをゴミ箱に移動しました（Google Driveのゴミ箱から復元可能）`);
  }
}

// --- CLI ---
async function main() {
  const [,, command, ...args] = process.argv;

  try {
    switch (command) {
      case 'list': {
        const folderId = args[0] || HP_FOLDER_ID;
        const files = await listFiles(folderId);
        console.log(`\n=== ${files.length} items ===\n`);
        for (const f of files) {
          const type = f.mimeType === 'application/vnd.google-apps.folder' ? '📁' : '📄';
          const size = f.size ? `${(parseInt(f.size) / 1024 / 1024).toFixed(1)}MB` : '';
          console.log(`${type} ${f.name}  ${size}  [${f.id}]`);
        }
        break;
      }

      case 'tree': {
        const folderId = args[0] || HP_FOLDER_ID;
        const depth = parseInt(args[1]) || 2;
        console.log(`\n=== Tree (depth: ${depth}) ===\n`);
        await printTree(folderId, depth);
        break;
      }

      case 'download': {
        if (!args[0]) { console.error('Usage: download <fileId> [destDir]'); process.exit(1); }
        await downloadFile(args[0], args[1] || DEFAULT_DOWNLOAD_DIR);
        break;
      }

      case 'download-folder': {
        if (!args[0]) { console.error('Usage: download-folder <folderId> [destDir]'); process.exit(1); }
        await downloadFolder(args[0], args[1] || DEFAULT_DOWNLOAD_DIR);
        break;
      }

      case 'search': {
        if (!args[0]) { console.error('Usage: search <query>'); process.exit(1); }
        const query = args.join(' ');
        console.log(`\nSearching for "${query}"...\n`);
        const results = await searchFiles(query);
        console.log(`Found ${results.length} results:\n`);
        for (const f of results) {
          const type = f.mimeType === 'application/vnd.google-apps.folder' ? '📁' : '📄';
          const size = f.size ? `${(parseInt(f.size) / 1024 / 1024).toFixed(1)}MB` : '';
          console.log(`${type} ${f.name}  ${size}  [${f.id}]`);
        }
        break;
      }

      case 'trash': {
        if (!args[0]) { console.error('Usage: trash <fileId>'); process.exit(1); }
        await trashFile(args[0]);
        break;
      }

      case 'dedup': {
        const folderId = (args[0] && !args[0].startsWith('-')) ? args[0] : HP_FOLDER_ID;
        const exec = args.includes('--exec');
        await dedup(folderId, exec);
        break;
      }

      default:
        console.log(`
Google Drive HP素材ツール
========================
Commands:
  list [folderId]              フォルダ一覧
  tree [folderId] [depth]      ツリー表示（デフォルト depth=2）
  download <fileId> [dest]     ファイルダウンロード
  download-folder <folderId> [dest]  フォルダ一括DL
  search <query>               ファイル名検索
  trash <fileId>               ゴミ箱に移動（復元可能）
  dedup [folderId] [--exec]    重複フォルダ整理（デフォルト: ドライラン）

Default folder: ポラーノプラザHP素材 (${HP_FOLDER_ID})
Default dest:   images/
        `);
    }
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

main();
