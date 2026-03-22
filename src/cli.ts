#!/usr/bin/env node

import { writeFileSync } from "node:fs";
import { basename, resolve } from "node:path";
import { assembleCSS } from "./css-assembler.js";
import { readImage } from "./image-reader.js";

function parseArgs(argv: string[]) {
  const args = argv.slice(2);

  if (args.length === 0) {
    console.error("Usage: kongyo-css <image> [--width N] [--tolerance N] [--output file.txt]");
    process.exit(1);
  }

  const inputPath = resolve(args[0]);
  let width: number | undefined;
  let tolerance = 0;
  let output: string | undefined;

  for (let i = 1; i < args.length; i++) {
    switch (args[i]) {
      case "--width":
        width = parseInt(args[++i], 10);
        break;
      case "--tolerance":
        tolerance = parseInt(args[++i], 10);
        break;
      case "--output":
        output = args[++i];
        break;
    }
  }

  if (!output) {
    output = resolve(basename(inputPath).replace(/\.[^.]+$/, ".txt"));
  }

  return { inputPath, width, tolerance, output };
}

async function main() {
  const { inputPath, width, tolerance, output } = parseArgs(process.argv);

  console.log(`Reading: ${inputPath}`);
  const imageData = await readImage(inputPath, width);
  console.log(`Size: ${imageData.width}x${imageData.height}`);

  console.log(`Generating CSS (tolerance=${tolerance})...`);
  const css = assembleCSS(imageData, tolerance);

  const sizeKB = (css.length / 1024).toFixed(1);
  console.log(`Output: ${sizeKB} KB (${css.length.toLocaleString()} chars)`);

  writeFileSync(output, css, "utf-8");
  console.log(`Written: ${output}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
