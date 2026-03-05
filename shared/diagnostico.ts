export type PillarKey = "P" | "A" | "G" | "O";

export interface PillarSubgroups {
  A: { vertical: number; horizontal: number; internal: number };
  G: { spiritual: number; emotional: number; financial: number; temporal: number };
  O: { basic: number; radical: number; fruit: number };
}

export interface StatusInfo {
  label: string;
  color: string;
  key: "solid" | "building" | "fragile" | "collapse";
}

export function getStatusInfo(media: number): StatusInfo {
  if (media >= 8) return { label: "solid", color: "#2E5E3E", key: "solid" };
  if (media >= 5.5) return { label: "building", color: "#B8A88A", key: "building" };
  if (media >= 3) return { label: "fragile", color: "#8B6914", key: "fragile" };
  return { label: "collapse", color: "#7A3030", key: "collapse" };
}
