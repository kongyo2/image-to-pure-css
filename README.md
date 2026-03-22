# @kongyo2/image-to-pure-css

画像をピュアCSSに変換するツールです。CSSの `linear-gradient` を使い、`<canvas>` や `<img>` タグを一切使わずに画像を再現します。

## 仕組み

画像の各行を1pxの高さの `linear-gradient` に変換し、`background-image` で重ね合わせることで1つの `<div>` 要素だけで画像を表現します。

主な最適化:

- 最も多い色を `background-color` に設定し、グラデーション数を削減
- 全ピクセルが背景色と同じ行はスキップ
- `background-size` / `background-repeat` は共通値を1つだけ指定
- 色コードは可能な限り短縮形（例: `#fff`）を使用

## インストール

```bash
npm install @kongyo2/image-to-pure-css
```

## 使い方

### CLI

```bash
npx kongyo-css <画像ファイル> [オプション]
```

#### オプション

| オプション | 説明 |
|---|---|
| `--width N` | 出力幅をNピクセルにリサイズ（アスペクト比維持） |
| `--tolerance N` | 色の類似判定の許容値（デフォルト: 0） |
| `--output file.txt` | 出力先ファイル（デフォルト: 入力ファイル名.txt） |

#### 例

```bash
# 基本的な変換
npx kongyo-css photo.png

# 幅100pxにリサイズして変換
npx kongyo-css photo.png --width 100

# 許容値を設定してファイルサイズを削減
npx kongyo-css photo.png --tolerance 10 --output output.txt
```

### ライブラリとして使用

```typescript
import { convertImageToCSS } from "@kongyo2/image-to-pure-css";

// ファイルパスから変換
const css = await convertImageToCSS("photo.png", {
  width: 100,
  tolerance: 5,
});

// Bufferから変換
const buffer = fs.readFileSync("photo.png");
const css = await convertImageToCSS(buffer);
```

### 個別モジュールのインポート

```typescript
import {
  readImage,
  assembleCSS,
  buildRowGradient,
  findDominantColor,
  rgbToCompressedColor,
  colorsAreSimilar,
} from "@kongyo2/image-to-pure-css";

// 画像を読み込み
const imageData = await readImage("photo.png", 100);

// CSSを生成
const css = assembleCSS(imageData, 0);
```

## 出力形式

インラインスタイル付きの `<div>` 要素が出力されます。

```html
<div style="width:100px;height:50px;background-color:#fff;background-image:linear-gradient(90deg,#f00 0,#0f0 50%,#00f 100%),...;background-size:100% 1px;background-position:0 0,0 1px,...;background-repeat:no-repeat"></div>
```

## ライセンス

[MIT](LICENSE)
