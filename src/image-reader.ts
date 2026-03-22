/**
 * 画像読み込みモジュール
 * sharpを使って画像をRGBピクセルマトリクスに変換する
 */

import sharp from "sharp";
import type { ImageData, RGB } from "./types.js";

export async function readImage(input: string | Buffer, maxWidth?: number): Promise<ImageData> {
  let pipeline = sharp(input);

  if (maxWidth) {
    pipeline = pipeline.resize(maxWidth, undefined, {
      fit: "inside",
      withoutEnlargement: true,
      kernel: sharp.kernel.lanczos3,
    });
  }

  const { data, info } = await pipeline.removeAlpha().raw().toBuffer({ resolveWithObject: true });

  const { width, height } = info;
  const pixels: RGB[][] = [];

  for (let y = 0; y < height; y++) {
    const row: RGB[] = [];
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 3;
      row.push({
        r: data[idx],
        g: data[idx + 1],
        b: data[idx + 2],
      });
    }
    pixels.push(row);
  }

  return { width, height, pixels };
}
