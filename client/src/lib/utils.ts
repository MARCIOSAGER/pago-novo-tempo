import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Validates that a returnTo path is a safe same-origin relative path.
 * Rejects protocol-relative URLs (//evil.com), full URLs, javascript: schemes,
 * backslash tricks, and control chars. Returns "/" if unsafe.
 */
export function safeReturnTo(value: string | null | undefined): string {
  if (typeof value !== "string" || value.length === 0 || value.length > 2000) return "/";
  if (!value.startsWith("/")) return "/";
  if (value.startsWith("//") || value.startsWith("/\\") || value.includes("://")) return "/";
  if (/[\x00-\x1f\s]/.test(value)) return "/";
  return value;
}
