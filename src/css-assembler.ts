/**
 * CSS組み立てモジュール
 * 全行のグラデーションを合成し、最終的なインラインスタイルのdivを生成する
 *
 * 最適化:
 * - 最頻出色をbackground-colorに設定
 * - 全ピクセルがbackground-colorの行はgradientをスキップ
 * - background-size/repeatは全レイヤー共通値を1つだけ指定
 */

import { rgbToCompressedColor } from "./color-utils.js";
import { buildRowGradient } from "./gradient-builder.js";
import type { ImageData } from "./types.js";

export function findDominantColor(imageData: ImageData): string {
  const colorCount = new Map<string, number>();

  for (const row of imageData.pixels) {
    for (const pixel of row) {
      const color = rgbToCompressedColor(pixel.r, pixel.g, pixel.b);
      colorCount.set(color, (colorCount.get(color) ?? 0) + 1);
    }
  }

  let maxCount = 0;
  let dominant = "#000";
  for (const [color, count] of colorCount) {
    if (count > maxCount) {
      maxCount = count;
      dominant = color;
    }
  }

  return dominant;
}

export function assembleCSS(imageData: ImageData, tolerance: number): string {
  const { width, height, pixels } = imageData;
  const bgColor = findDominantColor(imageData);

  const gradients: string[] = [];
  const positions: string[] = [];

  for (let y = 0; y < height; y++) {
    const result = buildRowGradient(pixels[y], tolerance);

    if (result.isSolid && result.solidColor === bgColor) {
      continue;
    }

    gradients.push(result.gradient);
    positions.push(y === 0 ? "0 0" : `0 ${y}px`);
  }

  const parts = [
    `width:${width}px`,
    `height:${height}px`,
    `background-color:${bgColor}`,
    `background-image:${gradients.join(",")}`,
    `background-size:100% 1px`,
    `background-position:${positions.join(",")}`,
    `background-repeat:no-repeat`,
  ];

  return `<div style="${parts.join(";")}"></div>`;
}
