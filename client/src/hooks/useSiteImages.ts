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

export function useSiteImages() {
  const { data } = trpc.siteSettings.getImages.useQuery(undefined, {
    staleTime: 5 * 60 * 1000, // cache 5 min
    refetchOnWindowFocus: false,
  });

  const get = (key: SiteImageKey): string => {
    return data?.[key] || DEFAULT_IMAGES[key];
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
