export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface ImageData {
  width: number;
  height: number;
  pixels: RGB[][];
}

export interface ConvertOptions {
  width?: number;
  tolerance?: number;
  output?: string;
}

export interface ColorRun {
  color: string;
  start: number;
  end: number;
}
