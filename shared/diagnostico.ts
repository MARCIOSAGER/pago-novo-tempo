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

function calcSubgroup(answers: number[], start: number, count: number): number {
  const slice = answers.slice(start, start + count);
  if (slice.length === 0) return 0;
  const soma = slice.reduce((sum, v) => sum + v, 0);
  return parseFloat(((soma / (count * 4)) * 10).toFixed(1));
}

export function computePillarSubgroups(answersA: number[], answersG: number[], answersO: number[]): PillarSubgroups {
  return {
    A: {
      vertical: calcSubgroup(answersA, 0, 4),
      horizontal: calcSubgroup(answersA, 4, 4),
      internal: calcSubgroup(answersA, 8, 4),
    },
    G: {
      spiritual: calcSubgroup(answersG, 0, 3),
      emotional: calcSubgroup(answersG, 3, 3),
      financial: calcSubgroup(answersG, 6, 3),
      temporal: calcSubgroup(answersG, 9, 3),
    },
    O: {
      basic: calcSubgroup(answersO, 0, 4),
      radical: calcSubgroup(answersO, 4, 4),
      fruit: calcSubgroup(answersO, 8, 4),
    },
  };
}

export function computeWeakestSubgroupPerPillar(subgroups: PillarSubgroups): Record<PillarKey, string | null> {
  const findWeakest = (subs: Record<string, number>): string | null => {
    let weakestKey: string | null = null;
    let lowest = Infinity;
    for (const [key, val] of Object.entries(subs)) {
      if (val < lowest) { lowest = val; weakestKey = key; }
    }
    return weakestKey;
  };
  return {
    P: null,
    A: findWeakest(subgroups.A as unknown as Record<string, number>),
    G: findWeakest(subgroups.G as unknown as Record<string, number>),
    O: findWeakest(subgroups.O as unknown as Record<string, number>),
  };
}
