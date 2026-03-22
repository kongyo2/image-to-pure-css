/**
 * CSS色圧縮ユーティリティ
 * RGB値を最短のCSS色表現に変換する
 */

const HEX_TO_NAME: ReadonlyMap<string, string> = new Map([
  ["#ff0000", "red"],
  ["#d2b48c", "tan"],
  ["#ffd700", "gold"],
  ["#cd853f", "peru"],
  ["#ffc0cb", "pink"],
  ["#dda0dd", "plum"],
  ["#808080", "gray"],
  ["#000080", "navy"],
  ["#008080", "teal"],
  ["#fffafa", "snow"],
  ["#ff7f50", "coral"],
  ["#f0e68c", "khaki"],
  ["#f5deb3", "wheat"],
  ["#fffff0", "ivory"],
  ["#faf0e6", "linen"],
  ["#f5f5dc", "beige"],
  ["#808000", "olive"],
  ["#f0ffff", "azure"],
  ["#a52a2a", "brown"],
  ["#008000", "green"],
  ["#ffe4c4", "bisque"],
  ["#a0522d", "sienna"],
  ["#da70d6", "orchid"],
  ["#fa8072", "salmon"],
  ["#ee82ee", "violet"],
  ["#ff6347", "tomato"],
  ["#800000", "maroon"],
  ["#ffa500", "orange"],
  ["#c0c0c0", "silver"],
  ["#800080", "purple"],
  ["#4b0082", "indigo"],
]);

const hexCache = new Map<number, string>();

function toHex2(n: number): string {
  return n.toString(16).padStart(2, "0");
}

export function rgbToCompressedColor(r: number, g: number, b: number): string {
  const key = (r << 16) | (g << 8) | b;
  const cached = hexCache.get(key);
  if (cached) return cached;

  const hex = `#${toHex2(r)}${toHex2(g)}${toHex2(b)}`;

  const named = HEX_TO_NAME.get(hex);
  if (named) {
    hexCache.set(key, named);
    return named;
  }

  if (hex[1] === hex[2] && hex[3] === hex[4] && hex[5] === hex[6]) {
    const short = `#${hex[1]}${hex[3]}${hex[5]}`;
    hexCache.set(key, short);
    return short;
  }

  hexCache.set(key, hex);
  return hex;
}

export function colorsAreSimilar(
  r1: number,
  g1: number,
  b1: number,
  r2: number,
  g2: number,
  b2: number,
  tolerance: number,
): boolean {
  return (
    Math.abs(r1 - r2) <= tolerance &&
    Math.abs(g1 - g2) <= tolerance &&
    Math.abs(b1 - b2) <= tolerance
  );
}
