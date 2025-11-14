type Rgb = {
  r: number;
  g: number;
  b: number;
};

const HEX_PATTERN = /^#?(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

const expandHex = (value: string): string => {
  if (value.length === 3) {
    return value
      .split('')
      .map((char) => char + char)
      .join('');
  }
  return value;
};

export const normalizeHex = (value: string | null | undefined, fallback: string): string => {
  if (typeof value !== 'string' || !HEX_PATTERN.test(value.trim())) {
    return normalizeHex(fallback, '#2563EB');
  }

  const sanitized = value.trim().replace('#', '').toLowerCase();
  const expanded = expandHex(sanitized);
  return `#${expanded.toUpperCase()}`;
};

const hexToRgb = (hex: string): Rgb => {
  const normalized = normalizeHex(hex, '#000000').replace('#', '');
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  return { r, g, b };
};

const rgbToHsl = ({ r, g, b }: Rgb): { h: number; s: number; l: number } => {
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;

  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  const delta = max - min;

  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (delta !== 0) {
    s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);

    switch (max) {
      case rNorm:
        h = (gNorm - bNorm) / delta + (gNorm < bNorm ? 6 : 0);
        break;
      case gNorm:
        h = (bNorm - rNorm) / delta + 2;
        break;
      default:
        h = (rNorm - gNorm) / delta + 4;
        break;
    }

    h /= 6;
  }

  return { h: h * 360, s, l };
};

const hslToRgb = (h: number, s: number, l: number): Rgb => {
  const hue = ((h % 360) + 360) % 360;

  if (s === 0) {
    const value = Math.round(l * 255);
    return { r: value, g: value, b: value };
  }

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const hk = hue / 360;

  const hueToChannel = (t: number) => {
    let temp = t;
    if (temp < 0) temp += 1;
    if (temp > 1) temp -= 1;
    if (temp < 1 / 6) return p + (q - p) * 6 * temp;
    if (temp < 1 / 2) return q;
    if (temp < 2 / 3) return p + (q - p) * (2 / 3 - temp) * 6;
    return p;
  };

  const r = hueToChannel(hk + 1 / 3);
  const g = hueToChannel(hk);
  const b = hueToChannel(hk - 1 / 3);

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
};

const rgbToHex = ({ r, g, b }: Rgb): string => {
  const channelToHex = (channel: number) =>
    clamp(Math.round(channel), 0, 255).toString(16).padStart(2, '0').toUpperCase();

  return `#${channelToHex(r)}${channelToHex(g)}${channelToHex(b)}`;
};

export const hexToHslString = (hex: string): string => {
  const { h, s, l } = rgbToHsl(hexToRgb(hex));
  return `${Math.round(h)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
};

export const getAccessibleTextColor = (hex: string): string => {
  const { r, g, b } = hexToRgb(hex);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness >= 140 ? '#000000' : '#FFFFFF';
};

export const adjustHexLightness = (hex: string, delta: number): string => {
  const { h, s, l } = rgbToHsl(hexToRgb(hex));
  const adjusted = hslToRgb(h, s, clamp(l + delta, 0, 1));
  return rgbToHex(adjusted);
};
