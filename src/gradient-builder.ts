/**
 * グラデーション構築モジュール
 *
 * 2つの動作モード:
 *
 * 【Hard Stop モード (tolerance=0)】
 *   - 隣接同色ピクセルをRLE圧縮
 *   - CSS gradient の "0" クランプトリックでハードストップ生成
 *   - ピクセル完全再現
 *
 * 【Smooth モード (tolerance>0)】
 *   - 貪欲線形近似アルゴリズムで最適なストップ位置を検出
 *   - CSSのネイティブ線形補間を活用して滑らかな遷移を表現
 *   - グラデーション領域のストップ数を大幅に削減
 *   - エッジ部分は自動的に短いセグメントになり鮮明さを維持
 */

import { rgbToCompressedColor } from "./color-utils.js";
import type { ColorRun, RGB } from "./types.js";

export interface RowGradientResult {
  gradient: string;
  isSolid: boolean;
  solidColor: string | null;
}

// ==========================================
// Hard Stop モード (tolerance=0)
// ==========================================

function buildRowRuns(row: RGB[]): ColorRun[] {
  if (row.length === 0) return [];

  const runs: ColorRun[] = [];
  let runColor = rgbToCompressedColor(row[0].r, row[0].g, row[0].b);
  let runStart = 0;

  for (let i = 1; i <= row.length; i++) {
    const color = i < row.length ? rgbToCompressedColor(row[i].r, row[i].g, row[i].b) : null;

    if (color !== runColor) {
      runs.push({ color: runColor, start: runStart, end: i });
      if (i < row.length && color !== null) {
        runColor = color;
        runStart = i;
      }
    }
  }

  return runs;
}

function runsToHardGradient(runs: ColorRun[]): string {
  if (runs.length === 1) {
    const c = runs[0].color;
    return `linear-gradient(${c},${c})`;
  }

  const stops: string[] = [];
  for (let i = 0; i < runs.length; i++) {
    const run = runs[i];
    if (i === 0) {
      stops.push(`${run.color} ${run.end}px`);
    } else if (i === runs.length - 1) {
      stops.push(`${run.color} 0`);
    } else {
      stops.push(`${run.color} 0 ${run.end}px`);
    }
  }

  return `linear-gradient(90deg,${stops.join(",")})`;
}

// ==========================================
// Smooth モード (tolerance>0)
// ==========================================

/**
 * row[start]→row[end] の線形補間が中間ピクセル全てにtolerance以内で一致するか判定
 */
function canLinearApproximate(row: RGB[], start: number, end: number, tolerance: number): boolean {
  if (end - start <= 1) return true;

  const sc = row[start];
  const ec = row[end];
  const span = end - start;

  for (let j = start + 1; j < end; j++) {
    const t = (j - start) / span;
    const er = sc.r + (ec.r - sc.r) * t;
    const eg = sc.g + (ec.g - sc.g) * t;
    const eb = sc.b + (ec.b - sc.b) * t;

    if (
      Math.abs(er - row[j].r) > tolerance ||
      Math.abs(eg - row[j].g) > tolerance ||
      Math.abs(eb - row[j].b) > tolerance
    ) {
      return false;
    }
  }

  return true;
}

/**
 * 貪欲法で線形近似可能な最長セグメントを見つけ、最適なストップ位置を返す
 */
function findOptimalStops(row: RGB[], tolerance: number): number[] {
  if (row.length <= 2) {
    return row.length === 1 ? [0] : [0, row.length - 1];
  }

  const stops: number[] = [0];
  let segStart = 0;

  for (let candidate = 2; candidate < row.length; candidate++) {
    if (!canLinearApproximate(row, segStart, candidate, tolerance)) {
      stops.push(candidate - 1);
      segStart = candidate - 1;
    }
  }

  if (stops[stops.length - 1] !== row.length - 1) {
    stops.push(row.length - 1);
  }

  return stops;
}

function stopsToSmoothGradient(row: RGB[], stops: number[]): string {
  const colors = stops.map((pos) => rgbToCompressedColor(row[pos].r, row[pos].g, row[pos].b));

  if (colors.every((c) => c === colors[0])) {
    return `linear-gradient(${colors[0]},${colors[0]})`;
  }

  const lastIdx = row.length - 1;
  const parts: string[] = [];

  for (let i = 0; i < stops.length; i++) {
    const pos = stops[i];
    const color = colors[i];

    if (i === 0 && pos === 0) {
      parts.push(color);
    } else if (i === stops.length - 1 && pos === lastIdx) {
      parts.push(color);
    } else {
      parts.push(`${color} ${pos}px`);
    }
  }

  return `linear-gradient(90deg,${parts.join(",")})`;
}

// ==========================================
// Public API
// ==========================================

export function buildRowGradient(row: RGB[], tolerance: number): RowGradientResult {
  if (tolerance === 0) {
    const runs = buildRowRuns(row);
    return {
      gradient: runsToHardGradient(runs),
      isSolid: runs.length === 1,
      solidColor: runs.length === 1 ? runs[0].color : null,
    };
  }

  const stops = findOptimalStops(row, tolerance);
  const firstColor = rgbToCompressedColor(row[stops[0]].r, row[stops[0]].g, row[stops[0]].b);
  const allSame = stops.every(
    (s) => rgbToCompressedColor(row[s].r, row[s].g, row[s].b) === firstColor,
  );

  return {
    gradient: stopsToSmoothGradient(row, stops),
    isSolid: allSame,
    solidColor: allSame ? firstColor : null,
  };
}
