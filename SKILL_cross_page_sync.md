# クロスページ同期スキル — ポラーノプラザWEB

## 目的
5つのHTMLファイル間で共有要素（ヘッダー、フッター、ナビ、@themeブロック、共通meta）を
確実に同期する。手動コピーによるミスを防止。

## 対象ファイル
```
index.html
pages/services.html
pages/works.html
pages/company.html
pages/contact.html
```

## 同期対象の共有要素

### 1. @theme ブロック（`<style type="text/tailwindcss">` 内）
- カラートークン（navy-*, accent-*, warm-*, surface-*）
- タイポグラフィ（font-display, font-body, font-serif, text-fluid-*）
- z-index スケール（z-base 〜 z-toast）
- spacing（section-y, section-x, bridge-y）
- **注意**: input.css にも同一の @theme があるため、3箇所の同期が必要

### 2. ヘッダー（`<header class="site-header">` 〜 `</header>`）
- ロゴ、ナビリンク、モバイルメニューボタン
- **相対パス注意**: index.html は `pages/xxx.html`、サブページは `../index.html` や `xxx.html`

### 3. フッター（`<footer>` 〜 `</footer>`）
- 会社情報、ナビリンク、copyright
- **相対パス注意**: 同上

### 4. モバイルメニュー（`<div id="mobile-menu">` 〜 対応する `</div>`）
- ナビリンク一覧
- **相対パス注意**: 同上

### 5. 共通 `<head>` 要素
- Google Fonts リンク
- Tailwind CDN スクリプト
- favicon / apple-touch-icon（相対パス注意）
- img-comparison-slider（使用ページのみ: index.html, works.html）

## 実行手順

### STEP 1: 変更元の特定
変更を行ったファイルを「ソース」として特定する。

### STEP 2: 差分抽出
ソースファイルから変更された共有要素のHTMLブロックを抽出。

### STEP 3: パス変換テーブル
| ソース | ターゲット | パス変換 |
|--------|-----------|---------|
| index.html | pages/*.html | `href="pages/` → `href="` / `href="images/` → `href="../images/` / `href="index.html"` → `href="../index.html"` |
| pages/*.html | index.html | 逆変換 |
| pages/*.html | pages/*.html | 変換不要 |

### STEP 4: 残り4ファイルに適用
Editツールで差分のみ適用。パスは変換テーブルに従う。

### STEP 5: 検証
- 全5ファイルで共有要素の構造が一致することをGrepで確認
- 相対パスが正しいことを目視確認

## 相対パス早見表

| 要素 | index.html | pages/*.html |
|------|-----------|-------------|
| CSS | css/input.css | ../css/input.css |
| JS | js/main.js | ../js/main.js |
| 画像 | images/xxx | ../images/xxx |
| トップページ | # (自身) | ../index.html |
| サブページ | pages/xxx.html | xxx.html |
| favicon | images/favicon.svg | ../images/favicon.svg |

## 禁止事項
- Writeで全体上書きしない（Edit差分のみ）
- ページ固有のコンテンツ（title, description, canonical, JSON-LD）を上書きしない
- 同期対象外の要素まで変更しない
