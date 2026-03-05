import type { PillarKey, PillarSubgroups } from "./useDiagnosticoReducer";

function calcSubgroup(answers: number[], start: number, count: number): number {
  const slice = answers.slice(start, start + count);
  if (slice.length === 0) return 0;
  const soma = slice.reduce((sum, v) => sum + v, 0);
  return parseFloat(((soma / (count * 4)) * 10).toFixed(1));
}

export function computePillarSubgroups(
  answersA: number[],
  answersG: number[],
  answersO: number[]
): PillarSubgroups {
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

export function computeWeakestSubgroupPerPillar(
  subgroups: PillarSubgroups
): Record<PillarKey, string | null> {
  const findWeakest = (subs: Record<string, number>): string | null => {
    let weakestKey: string | null = null;
    let lowest = Infinity;
    for (const [key, val] of Object.entries(subs)) {
      if (val < lowest) {
        lowest = val;
        weakestKey = key;
      }
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
