# ビジュアルQAスキル — ポラーノプラザWEB

## 目的
Playwright MCPを使い、変更後のページを実機レンダリングしてビジュアル品質を確認する。
デザインの崩れ、レスポンシブ対応、アクセシビリティ問題を早期検出。

## 対象ページ
| ページ | ローカルURL |
|--------|-----------|
| トップ | file:///C:/Users/LENOVO/.gemini/Poranoplazaweb/index.html |
| サービス | file:///C:/Users/LENOVO/.gemini/Poranoplazaweb/pages/services.html |
| 施工実績 | file:///C:/Users/LENOVO/.gemini/Poranoplazaweb/pages/works.html |
| 会社概要 | file:///C:/Users/LENOVO/.gemini/Poranoplazaweb/pages/company.html |
| お問い合わせ | file:///C:/Users/LENOVO/.gemini/Poranoplazaweb/pages/contact.html |

## チェック項目

### 1. レスポンシブ確認（3ブレークポイント）
| デバイス | 幅 | 高さ |
|---------|-----|------|
| Mobile | 375 | 812 |
| Tablet | 768 | 1024 |
| Desktop | 1440 | 900 |

### 2. ビジュアルチェックリスト
- [ ] ヘッダーが正しく表示（ロゴ + ナビ or ハンバーガー）
- [ ] ヒーロー画像が表示されている（画像パス正常）
- [ ] テキストの可読性（コントラスト、フォントサイズ）
- [ ] セクション間の余白が均等
- [ ] フッターが画面下に正しく配置
- [ ] 画像の縦横比が正しい（潰れ/引き伸ばしなし）
- [ ] モバイルでの横スクロールなし

### 3. インタラクション確認
- [ ] モバイルメニューの開閉
- [ ] スクロール時のヘッダー挙動（透過→ソリッド→hide/show）
- [ ] Before/Afterスライダー動作
- [ ] ライトボックス開閉（worksページ）
- [ ] フォームバリデーション（contactページ）

## 実行手順

### クイックチェック（変更後の最低確認）
1. 変更したページのみスクリーンショット（Desktop幅）
2. 変更セクション周辺を目視確認
3. 問題なければ完了

### フルチェック（デプロイ前）
1. 全5ページ × 3ブレークポイント = 15スクリーンショット
2. 各ページでスクロールして全セクション確認
3. インタラクション確認（メニュー、スライダー等）
4. 問題リストを作成し修正

## Playwright MCP 使用パターン

```
# ページ遷移
browser_navigate → URL指定

# リサイズ
browser_resize → width/height指定

# スクリーンショット
browser_take_screenshot

# スクロール
browser_evaluate → window.scrollTo(0, Y)

# スナップショット（DOM構造確認）
browser_snapshot
```

## 判定基準
- **Pass**: デザイン意図通り、崩れなし
- **Minor**: 微調整で修正可能（余白、フォントサイズ等）
- **Major**: レイアウト崩壊、コンテンツ欠落、画像表示不良
- **Critical**: ページが真っ白、JSエラーで機能停止
