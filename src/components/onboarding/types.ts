export type BackgroundColorId = 'ivory' | 'creamy-tan' | 'brown' | 'charcoal' | 'black';
export type TextColorId = 'ivory' | 'creamy-tan' | 'brown' | 'charcoal' | 'black';
export type FontFamilyId = 'inter' | 'lora' | 'courier-prime' | 'shadows-into-light' | 'jacquard-24';

export interface OnboardingData {
  name: string;
  backgroundColor: BackgroundColorId;
  textColor: TextColorId;
  font: FontFamilyId;
}

export interface ColorOption {
  id: BackgroundColorId;
  name: string;
  hex: string;
  isLight: boolean;
}

export interface FontOption {
  id: FontFamilyId;
  name: string;
  family: string;
  sampleText: string;
}

export const COLORS: ColorOption[] = [
  { id: 'ivory', name: 'Ivory', hex: '#FAF8F5', isLight: true },
  { id: 'creamy-tan', name: 'Creamy Tan', hex: '#E8DCC4', isLight: true },
  { id: 'brown', name: 'Brown', hex: '#5C4033', isLight: false },
  { id: 'charcoal', name: 'Charcoal', hex: '#2C3E50', isLight: false },
  { id: 'black', name: 'Black', hex: '#1A1A1A', isLight: false },
];

export const FONTS: FontOption[] = [
  { id: 'inter', name: 'Clean Sans', family: "'Inter', system-ui, sans-serif", sampleText: 'The quick brown fox' },
  { id: 'lora', name: 'Classic Serif', family: "'Lora', Georgia, serif", sampleText: 'The quick brown fox' },
  { id: 'courier-prime', name: 'Typewriter', family: "'Courier Prime', monospace", sampleText: 'The quick brown fox' },
  { id: 'shadows-into-light', name: 'Handwritten', family: "'Shadows Into Light', cursive", sampleText: 'The quick brown fox' },
  { id: 'jacquard-24', name: 'Vintage Display', family: "'Jacquard 24', serif", sampleText: 'The quick brown fox' },
];

export function getColorById(id: BackgroundColorId): ColorOption {
  return COLORS.find(c => c.id === id) || COLORS[0];
}

export function getFontById(id: FontFamilyId): FontOption {
  return FONTS.find(f => f.id === id) || FONTS[0];
}

export function getTextColorForBackground(bgId: BackgroundColorId): string {
  const bg = getColorById(bgId);
  return bg.isLight ? '#2C3E50' : '#FAF8F5';
}

// Valid text/background pairings for WCAG AA contrast
export function getValidTextColors(bgId: BackgroundColorId): TextColorId[] {
  const lightBackgrounds: BackgroundColorId[] = ['ivory', 'creamy-tan'];
  if (lightBackgrounds.includes(bgId)) {
    return ['brown', 'charcoal', 'black'];
  }
  return ['ivory', 'creamy-tan'];
}

export function isValidPairing(bgId: BackgroundColorId, textId: TextColorId): boolean {
  return getValidTextColors(bgId).includes(textId);
}
