const LANGUAGE_SELECTED_KEY = "univolt-language-selected";
const LOCALE_KEY = "univolt-locale";

export type StoredLocale = "ru" | "en" | "uz";

export function loadHasSelectedLanguage(): boolean {
  try {
    return localStorage.getItem(LANGUAGE_SELECTED_KEY) === "done";
  } catch {
    return false;
  }
}

export function saveLanguageSelected(): void {
  try {
    localStorage.setItem(LANGUAGE_SELECTED_KEY, "done");
  } catch {
    // ignore write errors
  }
}

export function loadLocale(): StoredLocale | null {
  try {
    const saved = localStorage.getItem(LOCALE_KEY) as StoredLocale | null;
    return saved ?? null;
  } catch {
    return null;
  }
}

export function saveLocale(locale: StoredLocale): void {
  try {
    localStorage.setItem(LOCALE_KEY, locale);
  } catch {
    // ignore write errors
  }
}

