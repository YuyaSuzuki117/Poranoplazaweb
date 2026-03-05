# デプロイ前チェックリスト — ポラーノプラザWEB

## 目的
GitHub Pages（mainブランチ push = 自動デプロイ）への公開前に、
品質・SEO・アクセシビリティ・パフォーマンスを網羅的に確認する。

## デプロイ先
- 本番: https://yuyasuzuki117.github.io/Poranoplazaweb/
- ブランチ: main（push で自動デプロイ）

---

## Phase 1: コード品質チェック（push前）

### HTML構文
- [ ] 全5ファイルで `<html lang="ja">` 設定済み
- [ ] 見出しレベルをスキップしていない（h1→h2→h3）
- [ ] 閉じタグの対応が正しい
- [ ] セマンティックタグ使用（header/nav/main/section/footer）

### クロスページ同期
- [ ] @themeブロックが全ページで一致（`SKILL_cross_page_sync.md` 参照）
- [ ] ヘッダーHTML構造が全ページで一致
- [ ] フッターHTML構造が全ページで一致
- [ ] モバイルメニューが全ページで一致
- [ ] 相対パスが正しい（index.html vs pages/*.html）

### JavaScript
- [ ] `js/main.js` にコンソールエラーなし
- [ ] `js/contact-form.js` のバリデーションが正常動作
- [ ] `js/comparison-slider.js` のスライダー初期化正常

### CSS
- [ ] `css/input.css` の @theme と各HTMLの `<style type="text/tailwindcss">` @theme が一致
- [ ] カスタムCSS変数に未使用のものがないか

---

## Phase 2: SEO・メタデータ（全5ページ）

### 各ページ必須メタデータ
- [ ] `<title>` — ユニーク、60文字以内
- [ ] `<meta name="description">` — ユニーク、120文字以内
- [ ] `<link rel="canonical">` — 正しいURL
- [ ] `<meta property="og:title">`
- [ ] `<meta property="og:description">`
- [ ] `<meta property="og:url">` — canonical と一致
- [ ] `<meta property="og:image">` — 絶対URL、画像が存在
- [ ] `<meta name="twitter:card">` = summary_large_image
- [ ] JSON-LD 構造化データ — 実在コンテンツのみ

### サイト全体
- [ ] `sitemap.xml` の `<lastmod>` が最新
- [ ] `robots.txt` が正しい
- [ ] favicon.svg が存在
- [ ] apple-touch-icon.png が存在
- [ ] og-image.jpg が存在

---

## Phase 3: アクセシビリティ（WCAG 2.1 AA）

- [ ] 全画像に alt 属性（装飾は aria-hidden="true"）
- [ ] アイコンのみボタンに aria-label
- [ ] フォーム入力に label 紐付け
- [ ] Tab キーで全インタラクティブ要素到達可能
- [ ] モバイルメニューにフォーカストラップ + Escape閉じ
- [ ] ライトボックスにフォーカストラップ + Escape閉じ
- [ ] コントラスト比 4.5:1 以上（テキスト/背景）
- [ ] prefers-reduced-motion 対応済み
- [ ] skip-link 動作確認

---

## Phase 4: パフォーマンス

- [ ] 画像が WebP 形式（可能な限り）
- [ ] 画像に srcset/sizes 設定
- [ ] 画像に loading="lazy"（ファーストビュー以外）
- [ ] Google Fonts に `display=swap`
- [ ] 外部スクリプトに defer 属性
- [ ] 不要な console.log がないこと

---

## Phase 5: ビジュアル確認（`SKILL_visual_qa.md` 参照）

- [ ] Desktop (1440px) で全5ページ確認
- [ ] Mobile (375px) で全5ページ確認
- [ ] ヒーロースライドショー動作
- [ ] Before/After スライダー動作
- [ ] フォームバリデーション動作

---

## Phase 6: Git & デプロイ

- [ ] `git status` で意図しないファイルが含まれていないか
- [ ] `.gitignore` で node_modules/ が除外されているか
- [ ] コミットメッセージが変更内容を正確に反映
- [ ] **ユーザー確認を取ってから push**

---

## 実行方法

```
# Phase 1-4 の自動チェック可能項目
grep -r "lang=" index.html pages/*.html  # lang属性
grep -rn "<title>" index.html pages/*.html  # title確認
grep -rn "canonical" index.html pages/*.html  # canonical確認

# Phase 5
→ SKILL_visual_qa.md に従ってPlaywrightで確認

# Phase 6
git status
git diff --stat
→ ユーザー確認後 git push
```
