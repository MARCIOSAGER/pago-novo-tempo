import { useEffect } from "react";
import { trpc } from "@/lib/trpc";

const DEFAULT_IMAGES = {
  "image.pillar.principles": "/images/pillars/principles.webp",
  "image.pillar.alignment": "/images/pillars/alignment.webp",
  "image.pillar.government": "/images/pillars/government.webp",
  "image.pillar.obedience": "/images/pillars/obedience.webp",
  "image.hero.background": "/images/pillars/hero-bg.png",
  "image.founder.jefferson": "/images/jefferson.png",
} as const;

export type SiteImageKey = keyof typeof DEFAULT_IMAGES;

const CACHE_KEY = "pago:siteImages";

function getCachedImages(): Record<string, string> | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function useSiteImages() {
  const { data } = trpc.siteSettings.getImages.useQuery(undefined, {
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (data && Object.keys(data).length > 0) {
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(data));
      } catch {}
    }
  }, [data]);

  const cached = getCachedImages();

  const get = (key: SiteImageKey): string => {
    if (data) return data[key] || DEFAULT_IMAGES[key];
    return cached?.[key] || DEFAULT_IMAGES[key];
  };

  return {
    principles: get("image.pillar.principles"),
    alignment: get("image.pillar.alignment"),
    government: get("image.pillar.government"),
    obedience: get("image.pillar.obedience"),
    hero: get("image.hero.background"),
    jefferson: get("image.founder.jefferson"),
  };
}
