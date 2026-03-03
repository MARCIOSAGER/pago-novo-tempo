import { trpc } from "@/lib/trpc";

const DEFAULT_LINKS = {
  "link.kids.pdf": "/api/downloads/ebook-kids-pdf",
  "link.kids.flipbook": "/api/downloads/ebook-kids-flipbook",
  "link.kids.certificate": "/api/downloads/certificado-kids",
} as const;

export type SiteLinkKey = keyof typeof DEFAULT_LINKS;

export function useSiteLinks() {
  const { data } = trpc.siteSettings.getLinks.useQuery(undefined, {
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const get = (key: SiteLinkKey): string => {
    return data?.[key] || DEFAULT_LINKS[key];
  };

  return {
    kidsPdf: get("link.kids.pdf"),
    kidsFlipbook: get("link.kids.flipbook"),
    kidsCertificate: get("link.kids.certificate"),
  };
}
