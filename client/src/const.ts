export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

export const getGoogleLoginUrl = (returnTo?: string) =>
  `/api/oauth/google${returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ""}`;
export const getGithubLoginUrl = (returnTo?: string) =>
  `/api/oauth/github${returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ""}`;

// Default login URL — now points to local login page
export const getLoginUrl = (returnTo?: string) =>
  `/login${returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ""}`;
