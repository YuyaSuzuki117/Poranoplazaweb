# セクション編集スキル — ポラーノプラザWEB

## 目的
大きなHTML（index.htmlは800行超）のセクション単位編集を安全かつ効率的に行う。
ファイル全体をコンテキストに読み込まず、対象セクションのみを操作する。

## 全ページのセクション構成

### index.html
| セクション | 識別子 | 概要 |
|-----------|--------|------|
| ヒーロー | `.hero-slideshow` | 5枚スライドショー + テキスト |
| コンセプト | `#concept` | 企業理念・ワンストップ訴求 |
| サービス概要 | `#services` | 4サービスカード |
| 施工実績ハイライト | `#works` | Before/After + ギャラリー帯 |
| 実績数字 | `#numbers` or `data-counter-target` | カウンターアニメーション |
| 選ばれる理由 | `#reasons` | 3-4つの強み |
| お客様の声 | `#testimonials` | テスティモニアルカード |
| CTA | `#cta` | 問い合わせ誘導 |

### pages/services.html
| セクション | 識別子 | 概要 |
|-----------|--------|------|
| ページヒーロー | セクション冒頭 | サービス紹介バナー |
| 内装工事 | サービス詳細 | メインサービス |
| 空調設備 | サービス詳細 | 空調 |
| 電気工事 | サービス詳細 | 電気 |
| 消防設備 | サービス詳細 | 消防 |

### pages/works.html
| セクション | 識別子 | 概要 |
|-----------|--------|------|
| カテゴリフィルタ | `[data-filter]` | 業態フィルターボタン |
| プロジェクトカード | `[data-category]` | 施工実績カード群 |
| ライトボックス | `#lightbox` | 写真拡大表示 |

### pages/company.html
| セクション | 識別子 | 概要 |
|-----------|--------|------|
| 会社情報 | — | 基本情報テーブル |
| 資格・実績 | — | 保有資格一覧 |
| アクセス | — | Google Map |

### pages/contact.html
| セクション | 識別子 | 概要 |
|-----------|--------|------|
| フォーム | `#contact-form` | 問い合わせフォーム |
| 電話CTA | — | 電話番号 |

## 編集手順

### STEP 1: セクション特定
```
# id/class で検索して行番号を取得
Grep → "id=\"concept\"" in index.html → 行番号取得
```

### STEP 2: 対象範囲のみ読み込み
```
# 特定した行番号の前後を読む（±30行）
Read → offset: (行番号-15), limit: 60
```

### STEP 3: 編集
```
# Editツールで差分のみ適用
Edit → old_string (現在のHTML), new_string (変更後のHTML)
```

### STEP 4: 変更報告
箇条書き3行以内:
- 何を変えたか
- 影響範囲（このセクションのみ / クロスページ同期必要）
- 次のアクション（あれば）

## コンポーネントパターン集

### セクションラベル（eyebrow）
```html
<span class="section-label">Concept</span>
```

### セクション見出し
```html
<h2 class="section-heading">見出しテキスト</h2>
<p class="section-subheading">サブテキスト</p>
```

### Bentoカード
```html
<div class="bento-card">
  <img src="..." alt="..." loading="lazy">
  <div class="bento-card-overlay">
    <h3>タイトル</h3>
    <p>説明</p>
  </div>
</div>
```

### プロジェクトカード（AK風）
```html
<div class="project-card">
  <img src="..." alt="..." loading="lazy">
  <div class="project-card-body">
    <h3>プロジェクト名</h3>
    <p>説明</p>
  </div>
</div>
```

### Before/After スライダー
```html
<div class="photo-frame">
  <img-comparison-slider>
    <img slot="first" src="before.webp" alt="施工前">
    <img slot="second" src="after.webp" alt="施工後">
    <div slot="handle" class="slider-handle">
      <svg>...</svg>
    </div>
    <span class="slider-label slider-label--before">Before</span>
    <span class="slider-label slider-label--after">After</span>
  </img-comparison-slider>
</div>
```

### スクロールリビール
```html
<div class="reveal">コンテンツ</div>

<!-- スタガー -->
<div class="reveal-stagger">
  <div class="reveal">1</div>
  <div class="reveal">2</div>
  <div class="reveal">3</div>
</div>
```

### ボタン
```html
<a href="..." class="btn-primary">テキスト</a>
<a href="..." class="btn-secondary">テキスト</a>
```

## 禁止事項
- ファイル全体をRead/Writeしない
- 編集対象外のセクションに触れない
- 既存のコンポーネントパターンから逸脱しない（新パターンはCLAUDE.mdに追記してから使用）
