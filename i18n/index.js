/**
 * i18n — Internationalisation loader
 *
 * Usage:
 *   import { t, setLanguage, currentLang } from './i18n/index.js'
 *
 *   // Switch language
 *   await setLanguage('ca')
 *
 *   // Get a translated value by dot-path key
 *   t('hero.title')         // → "Bona taula, moments memorables."
 *   t('menu.dishes.combo-frankfurt.name') // → "Frankfurt, patates i ou"
 *
 * Adding a new language:
 *   1. Create i18n/<code>.json  (e.g. i18n/de.json)
 *   2. Add '<code>' to the LANGUAGES array below
 *   3. Done — no other code changes needed
 *
 * Removing a language:
 *   1. Remove its entry from LANGUAGES
 *   2. Optionally delete the .json file
 */

const LANGUAGES = ['ca', 'de', 'es', 'en', 'fr', 'ru'];
const DEFAULT_LANG = 'ca';
const STORAGE_KEY = 'rio_de_gusto_lang';

let translations = {};
let currentLanguage = DEFAULT_LANG;

/**
 * Resolve a dot-path key against a nested object.
 * e.g. resolve({ a: { b: 'c' } }, 'a.b') → 'c'
 */
function resolve(obj, path) {
  return path.split('.').reduce((acc, key) => {
    if (acc && typeof acc === 'object' && key in acc) return acc[key];
    return undefined;
  }, obj);
}

/**
 * Return the translated string for a given dot-path key.
 * Falls back to the key itself if the translation is missing.
 */
export function t(key) {
  const value = resolve(translations, key);
  return value !== undefined ? value : key;
}

/**
 * Return the current language code.
 */
export function getCurrentLang() {
  return currentLanguage;
}

/**
 * Return the list of available language codes.
 */
export function getAvailableLangs() {
  return [...LANGUAGES];
}

/**
 * Load a language JSON file and apply translations to the DOM.
 * @param {string} lang — language code (e.g. 'ca', 'en')
 */
export async function setLanguage(lang) {
  if (!LANGUAGES.includes(lang)) {
    console.warn(`[i18n] Language "${lang}" is not in the supported list. Falling back to "${DEFAULT_LANG}".`);
    lang = DEFAULT_LANG;
  }

  try {
    const response = await fetch(`i18n/${lang}.json`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    translations = await response.json();
  } catch (err) {
    console.error(`[i18n] Failed to load i18n/${lang}.json:`, err);
    // Attempt fallback
    if (lang !== DEFAULT_LANG) {
      return setLanguage(DEFAULT_LANG);
    }
    translations = {};
  }

  currentLanguage = lang;
  localStorage.setItem(STORAGE_KEY, lang);
  applyTranslations();
}

/**
 * Apply the loaded translations to all elements with a data-i18n attribute.
 * The attribute value is a dot-path key into the translations object.
 * Special cases:
 *   data-i18n="key"        → sets textContent
 *   data-i18n-alt="key"    → sets alt attribute
 *   data-i18n-placeholder  → sets placeholder attribute
 *   data-i18n-aria="key"   → sets aria-label attribute
 */
function applyTranslations() {
  // textContent nodes
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    el.textContent = t(key);
  });

  // alt attributes (images)
  document.querySelectorAll('[data-i18n-alt]').forEach((el) => {
    const key = el.getAttribute('data-i18n-alt');
    el.setAttribute('alt', t(key));
  });

  // placeholder attributes
  document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    const key = el.getAttribute('data-i18n-placeholder');
    el.setAttribute('placeholder', t(key));
  });

  // aria-label attributes
  document.querySelectorAll('[data-i18n-aria]').forEach((el) => {
    const key = el.getAttribute('data-i18n-aria');
    el.setAttribute('aria-label', t(key));
  });

  // innerHTML nodes (for HTML-safe content like schedules)
  document.querySelectorAll('[data-i18n-html]').forEach((el) => {
    const key = el.getAttribute('data-i18n-html');
    el.innerHTML = t(key);
  });

  // Update html lang attribute
  document.documentElement.setAttribute('lang', currentLanguage);

  // Dispatch a custom event so other scripts can react
  document.dispatchEvent(new CustomEvent('i18n:changed', {
    detail: { language: currentLanguage, translations }
  }));
}

/**
 * Detect the user's preferred language from the browser, falling back to
 * the stored preference or the default.
 */
function detectLanguage() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && LANGUAGES.includes(stored)) return stored;

  // Try browser language (e.g. 'ca', 'es-ES')
  const browserLangs = navigator.languages || [navigator.language];
  for (const bl of browserLangs) {
    const code = bl.split('-')[0];
    if (LANGUAGES.includes(code)) return code;
  }

  return DEFAULT_LANG;
}

/**
 * Initialise i18n: detect language, load translations, setup.
 * Call once on page load.
 */
export async function initI18n() {
  const lang = detectLanguage();
  await setLanguage(lang);
}