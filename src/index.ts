export { colorsAreSimilar, rgbToCompressedColor } from "./color-utils.js";
export { assembleCSS, findDominantColor } from "./css-assembler.js";
export {
  buildRowGradient,
  type RowGradientResult,
} from "./gradient-builder.js";
export { readImage } from "./image-reader.js";
export type { ColorRun, ConvertOptions, ImageData, RGB } from "./types.js";

import { assembleCSS } from "./css-assembler.js";
import { readImage } from "./image-reader.js";

export interface ConvertImageOptions {
  width?: number;
  tolerance?: number;
}

export async function convertImageToCSS(
  input: string | Buffer,
  options: ConvertImageOptions = {},
): Promise<string> {
  const { width, tolerance = 0 } = options;
  const imageData = await readImage(input, width);
  return assembleCSS(imageData, tolerance);
}
