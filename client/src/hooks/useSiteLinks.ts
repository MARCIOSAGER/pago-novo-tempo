import { useEffect } from "react";
import { trpc } from "@/lib/trpc";

const DEFAULT_LINKS = {
  "link.kids.pdf": "/api/downloads/ebook-kids-pdf",
  "link.kids.flipbook": "/api/downloads/ebook-kids-flipbook",
  "link.kids.certificate": "/api/downloads/certificado-kids",
} as const;

export type SiteLinkKey = keyof typeof DEFAULT_LINKS;

const CACHE_KEY = "pago:siteLinks";

function getCachedLinks(): Record<string, string> | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function useSiteLinks() {
  const { data } = trpc.siteSettings.getLinks.useQuery(undefined, {
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

  const cached = getCachedLinks();

  const get = (key: SiteLinkKey): string => {
    if (data) return data[key] || DEFAULT_LINKS[key];
    return cached?.[key] || DEFAULT_LINKS[key];
  };

  return {
    kidsPdf: get("link.kids.pdf"),
    kidsFlipbook: get("link.kids.flipbook"),
    kidsCertificate: get("link.kids.certificate"),
  };
}
