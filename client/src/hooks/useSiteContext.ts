export type SiteContext = "main" | "corp";

const CORP_HOSTS = ["pagocorp.com", "www.pagocorp.com"];

export function getSiteContext(): SiteContext {
  if (typeof window === "undefined") return "main";
  const host = window.location.hostname.toLowerCase();
  return CORP_HOSTS.includes(host) ? "corp" : "main";
}

export function useSiteContext(): SiteContext {
  return getSiteContext();
}
