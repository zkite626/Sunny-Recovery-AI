/**
 * 画布颜色分析 → 情绪文字描述
 * DeepSeek 不支持图片输入，通过分析像素颜色分布生成文字描述
 */

interface ColorAnalysis {
  warmRatio: number;
  coolRatio: number;
  darkRatio: number;
  lightRatio: number;
  dominantHue: string;
  strokeIntensity: string;
  description: string;
}

function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return { h: h * 360, s, l };
}

export function analyzeCanvasMood(canvas: HTMLCanvasElement): ColorAnalysis {
  const ctx = canvas.getContext('2d');
  if (!ctx) return { warmRatio: 0, coolRatio: 0, darkRatio: 0, lightRatio: 0, dominantHue: '未知', strokeIntensity: '稀疏', description: '无法分析画布' };

  const w = canvas.width;
  const h = canvas.height;
  const sampleStep = 4; // Sample every 4 pixels
  const imageData = ctx.getImageData(0, 0, w, h);
  const pixels = imageData.data;

  let totalSampled = 0;
  let nonWhitePixels = 0;
  let warmCount = 0;
  let coolCount = 0;
  let darkCount = 0;
  let lightCount = 0;
  const hueBuckets: Record<string, number> = {
    '红': 0, '橙': 0, '黄': 0, '绿': 0, '蓝': 0, '紫': 0, '灰': 0,
  };

  for (let y = 0; y < h; y += sampleStep) {
    for (let x = 0; x < w; x += sampleStep) {
      const i = (y * w + x) * 4;
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      const a = pixels[i + 3];

      if (a < 10) continue; // Skip transparent
      if (r > 245 && g > 245 && b > 245) continue; // Skip near-white

      totalSampled++;
      nonWhitePixels++;

      const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
      const { h: hue, l } = hexToHsl(hex);

      // Warm vs cool
      if ((hue >= 0 && hue <= 60) || (hue >= 300 && hue <= 360)) warmCount++;
      else coolCount++;

      // Light vs dark
      if (l < 0.35) darkCount++;
      else if (l > 0.65) lightCount++;

      // Hue bucket
      if (hue < 15 || hue >= 345) hueBuckets['红']++;
      else if (hue < 45) hueBuckets['橙']++;
      else if (hue < 75) hueBuckets['黄']++;
      else if (hue < 165) hueBuckets['绿']++;
      else if (hue < 255) hueBuckets['蓝']++;
      else if (hue < 345) hueBuckets['紫']++;
    }
  }

  if (nonWhitePixels === 0) {
    return { warmRatio: 0, coolRatio: 0, darkRatio: 0, lightRatio: 0, dominantHue: '空白', strokeIntensity: '稀疏', description: '画布为空白' };
  }

  const warmRatio = warmCount / nonWhitePixels;
  const coolRatio = coolCount / nonWhitePixels;
  const darkRatio = darkCount / nonWhitePixels;
  const lightRatio = lightCount / nonWhitePixels;

  // Dominant hue
  const sortedHues = Object.entries(hueBuckets).sort((a, b) => b[1] - a[1]);
  const dominantHue = sortedHues[0][1] > 0 ? sortedHues[0][0] : '未知';

  // Stroke intensity based on pixel coverage
  const coverage = nonWhitePixels / (w * h / (sampleStep * sampleStep));
  const strokeIntensity = coverage > 0.5 ? '密集饱满' : coverage > 0.2 ? '适中' : '轻柔分散';

  // Build description
  const parts: string[] = [];
  parts.push(`画面以${dominantHue}色为主色调`);

  if (warmRatio > 0.6) parts.push('暖色调占主导，画面温暖而富有能量');
  else if (coolRatio > 0.6) parts.push('冷色调占主导，画面宁静而内敛');
  else parts.push('冷暖色调交织，画面情感丰富');

  if (darkRatio > 0.5) parts.push('整体偏暗，可能带有沉重或深沉的情绪');
  else if (lightRatio > 0.5) parts.push('整体明亮，情绪偏向积极开放');

  parts.push(`笔触${strokeIntensity}`);

  return {
    warmRatio,
    coolRatio,
    darkRatio,
    lightRatio,
    dominantHue,
    strokeIntensity,
    description: parts.join('，'),
  };
}
