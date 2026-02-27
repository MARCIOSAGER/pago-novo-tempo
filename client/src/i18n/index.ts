import pt from "./pt";
import en from "./en";
import es from "./es";
import type { Translations } from "./pt";

export type Language = "pt" | "en" | "es";

export const translations: Record<Language, Translations> = {
  pt,
  en,
  es,
};

export type { Translations };
export { pt, en, es };
