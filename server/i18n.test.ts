import { describe, it, expect } from "vitest";
import pt from "../client/src/i18n/pt";
import en from "../client/src/i18n/en";
import es from "../client/src/i18n/es";

/**
 * Recursively get all leaf keys from a nested object.
 * Returns an array of dot-separated key paths.
 */
function getLeafKeys(obj: Record<string, any>, prefix = ""): string[] {
  const keys: string[] = [];
  for (const key of Object.keys(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    const value = obj[key];
    if (value !== null && typeof value === "object" && !Array.isArray(value)) {
      keys.push(...getLeafKeys(value, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

/**
 * Recursively get a value from a nested object using a dot-separated key path.
 */
function getNestedValue(obj: Record<string, any>, path: string): any {
  return path.split(".").reduce((current, key) => current?.[key], obj);
}

describe("i18n Translation Files", () => {
  const ptKeys = getLeafKeys(pt as any);
  const enKeys = getLeafKeys(en as any);
  const esKeys = getLeafKeys(es as any);

  it("should have all required top-level sections in PT", () => {
    expect(pt).toHaveProperty("nav");
    expect(pt).toHaveProperty("hero");
    expect(pt).toHaveProperty("about");
    expect(pt).toHaveProperty("pillars");
    expect(pt).toHaveProperty("jefferson");
    expect(pt).toHaveProperty("kit");
    expect(pt).toHaveProperty("cta");
    expect(pt).toHaveProperty("faq");
    expect(pt).toHaveProperty("footer");
    expect(pt).toHaveProperty("chatbot");
    expect(pt).toHaveProperty("cookieBanner");
    expect(pt).toHaveProperty("langSelector");
  });

  it("should have all required top-level sections in EN", () => {
    expect(en).toHaveProperty("nav");
    expect(en).toHaveProperty("hero");
    expect(en).toHaveProperty("about");
    expect(en).toHaveProperty("pillars");
    expect(en).toHaveProperty("jefferson");
    expect(en).toHaveProperty("kit");
    expect(en).toHaveProperty("cta");
    expect(en).toHaveProperty("faq");
    expect(en).toHaveProperty("footer");
    expect(en).toHaveProperty("chatbot");
    expect(en).toHaveProperty("cookieBanner");
    expect(en).toHaveProperty("langSelector");
  });

  it("should have all required top-level sections in ES", () => {
    expect(es).toHaveProperty("nav");
    expect(es).toHaveProperty("hero");
    expect(es).toHaveProperty("about");
    expect(es).toHaveProperty("pillars");
    expect(es).toHaveProperty("jefferson");
    expect(es).toHaveProperty("kit");
    expect(es).toHaveProperty("cta");
    expect(es).toHaveProperty("faq");
    expect(es).toHaveProperty("footer");
    expect(es).toHaveProperty("chatbot");
    expect(es).toHaveProperty("cookieBanner");
    expect(es).toHaveProperty("langSelector");
  });

  it("EN should have the same keys as PT (no missing translations)", () => {
    const missingInEn = ptKeys.filter((key) => !enKeys.includes(key));
    expect(missingInEn).toEqual([]);
  });

  it("ES should have the same keys as PT (no missing translations)", () => {
    const missingInEs = ptKeys.filter((key) => !esKeys.includes(key));
    expect(missingInEs).toEqual([]);
  });

  it("should not have extra keys in EN that are not in PT", () => {
    const extraInEn = enKeys.filter((key) => !ptKeys.includes(key));
    expect(extraInEn).toEqual([]);
  });

  it("should not have extra keys in ES that are not in PT", () => {
    const extraInEs = esKeys.filter((key) => !ptKeys.includes(key));
    expect(extraInEs).toEqual([]);
  });

  it("should not have empty string values in PT", () => {
    const emptyKeys = ptKeys.filter((key) => {
      const value = getNestedValue(pt as any, key);
      return typeof value === "string" && value.trim() === "";
    });
    expect(emptyKeys).toEqual([]);
  });

  it("should not have empty string values in EN", () => {
    const emptyKeys = enKeys.filter((key) => {
      const value = getNestedValue(en as any, key);
      return typeof value === "string" && value.trim() === "";
    });
    expect(emptyKeys).toEqual([]);
  });

  it("should not have empty string values in ES", () => {
    const emptyKeys = esKeys.filter((key) => {
      const value = getNestedValue(es as any, key);
      return typeof value === "string" && value.trim() === "";
    });
    expect(emptyKeys).toEqual([]);
  });

  it("should have the same number of FAQ items in all languages", () => {
    expect(pt.faq.items.length).toBeGreaterThan(0);
    expect(en.faq.items.length).toBe(pt.faq.items.length);
    expect(es.faq.items.length).toBe(pt.faq.items.length);
  });

  it("should have the same number of pillar items in all languages", () => {
    expect(pt.pillars.items.length).toBeGreaterThan(0);
    expect(en.pillars.items.length).toBe(pt.pillars.items.length);
    expect(es.pillars.items.length).toBe(pt.pillars.items.length);
  });

  it("EN translations should be different from PT (actually translated)", () => {
    expect(en.hero.subtitle).not.toBe(pt.hero.subtitle);
    expect(en.about.description).not.toBe(pt.about.description);
    expect(en.nav.about).not.toBe(pt.nav.about);
  });

  it("ES translations should be different from PT (actually translated)", () => {
    expect(es.hero.subtitle).not.toBe(pt.hero.subtitle);
    expect(es.about.description).not.toBe(pt.about.description);
    expect(es.nav.about).not.toBe(pt.nav.about);
  });

  it("should have 3 language options in langSelector", () => {
    expect(pt.langSelector).toHaveProperty("pt");
    expect(pt.langSelector).toHaveProperty("en");
    expect(pt.langSelector).toHaveProperty("es");
  });
});
