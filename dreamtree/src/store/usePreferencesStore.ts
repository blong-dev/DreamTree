/**
 * Preferences State Store
 * Manages user aesthetic preferences
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PreferencesState {
  // Aesthetic preferences
  backgroundColor: string;
  fontFamily: string;
  textColor: string;

  // Actions
  setBackgroundColor: (color: string) => void;
  setFontFamily: (font: string) => void;
  setTextColor: (color: string) => void;
  setPreferences: (prefs: {
    backgroundColor?: string;
    fontFamily?: string;
    textColor?: string;
  }) => void;
  reset: () => void;
}

const initialState = {
  backgroundColor: '#FFFFFF', // White
  fontFamily: 'sans',
  textColor: '#1F2937', // Charcoal
};

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      ...initialState,

      setBackgroundColor: (color) => set({ backgroundColor: color }),

      setFontFamily: (font) => set({ fontFamily: font }),

      setTextColor: (color) => set({ textColor: color }),

      setPreferences: (prefs) =>
        set((state) => ({
          backgroundColor: prefs.backgroundColor ?? state.backgroundColor,
          fontFamily: prefs.fontFamily ?? state.fontFamily,
          textColor: prefs.textColor ?? state.textColor,
        })),

      reset: () => set({ ...initialState }),
    }),
    {
      name: 'dreamtree-preferences',
    }
  )
);
