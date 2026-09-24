import { createContext } from 'react';
import type { Language } from '../../../shared/core/languages';

export interface LanguageState {
  language: Language;
  setLanguage: (language: Language) => void;
}

export const LanguageContext = createContext<LanguageState | null>(null);
