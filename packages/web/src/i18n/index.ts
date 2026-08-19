/**
 * Tiny translation layer: pick a locale from the browser (or the saved
 * choice), look strings up by key, fill {placeholders}.
 */

import { cs } from './cs.js';
import { de } from './de.js';
import { en, type Dictionary } from './en.js';
import { es } from './es.js';
import { fr } from './fr.js';
import { it } from './it.js';
import { ja } from './ja.js';
import { ko } from './ko.js';
import { pl } from './pl.js';
import { pt } from './pt.js';
import { ru } from './ru.js';
import { tr } from './tr.js';
import { zh } from './zh.js';

/** Locale code -> dictionary and the name shown in the picker. */
export const LOCALES = {
  en: { name: 'English', dictionary: en as Dictionary },
  ru: { name: 'Русский', dictionary: ru },
  de: { name: 'Deutsch', dictionary: de },
  fr: { name: 'Français', dictionary: fr },
  es: { name: 'Español', dictionary: es },
  it: { name: 'Italiano', dictionary: it },
  pt: { name: 'Português', dictionary: pt },
  pl: { name: 'Polski', dictionary: pl },
  cs: { name: 'Čeština', dictionary: cs },
  tr: { name: 'Türkçe', dictionary: tr },
  zh: { name: '中文', dictionary: zh },
  ja: { name: '日本語', dictionary: ja },
  ko: { name: '한국어', dictionary: ko },
} as const;

export type LocaleCode = keyof typeof LOCALES;
export type MessageKey = keyof Dictionary;

const STORAGE_KEY = 'stlfixer.locale';

let current: LocaleCode = 'en';

export function currentLocale(): LocaleCode {
  return current;
}

export function setLocale(code: LocaleCode, remember = true): void {
  current = code;
  document.documentElement.lang = code;
  if (remember) {
    try {
      localStorage.setItem(STORAGE_KEY, code);
    } catch {
      // Private mode and the like: the choice just will not stick.
    }
  }
}

/** Saved choice first, then whatever the browser asks for, then English. */
export function detectLocale(): LocaleCode {
  let saved: string | null = null;
  try {
    saved = localStorage.getItem(STORAGE_KEY);
  } catch {
    saved = null;
  }
  if (saved && saved in LOCALES) return saved as LocaleCode;

  for (const tag of navigator.languages ?? [navigator.language]) {
    const base = tag.toLowerCase().split('-')[0];
    if (base in LOCALES) return base as LocaleCode;
  }
  return 'en';
}

export function t(key: MessageKey, values: Record<string, string | number> = {}): string {
  const dictionary = LOCALES[current].dictionary;
  const template = dictionary[key] || LOCALES.en.dictionary[key];
  return template.replace(/\{(\w+)\}/g, (whole, name: string) => {
    const value = values[name];
    return value === undefined ? whole : String(value);
  });
}

/** Locale-aware thousands separators, so 68 067 looks native. */
export function num(value: number, digits?: number): string {
  return value.toLocaleString(current, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}
