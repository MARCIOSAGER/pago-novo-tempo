export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

export const getGoogleLoginUrl = () => `/api/oauth/google`;
export const getGithubLoginUrl = () => `/api/oauth/github`;

// Default login URL (Google)
export const getLoginUrl = () => getGoogleLoginUrl();
