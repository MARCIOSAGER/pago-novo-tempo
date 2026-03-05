import { useReducer, useEffect, useCallback, useMemo } from "react";
import type { PillarKey, PillarSubgroups } from "@shared/diagnostico";
import { getStatusInfo } from "@shared/diagnostico";

export type { PillarKey, PillarSubgroups, StatusInfo } from "@shared/diagnostico";
export { getStatusInfo } from "@shared/diagnostico";

const PILLAR_QUESTION_COUNTS: Record<PillarKey, number> = {
  P: 8,
  A: 12,
  G: 12,
  O: 12,
};

const PILLAR_ORDER: PillarKey[] = ["P", "A", "G", "O"];

const STORAGE_KEY = "pago-diagnostico-state-v3";

export interface DiagnosticoState {
  nome: string;
  currentStep: number; // 0=hero, 1=P, 2=A, 3=G, 4=O, 5=results
  answers: Record<PillarKey, (number | null)[]>;
  completed: boolean;
}

type DiagnosticoAction =
  | { type: "SET_NAME"; nome: string }
  | { type: "SET_ANSWER"; pillar: PillarKey; index: number; value: number }
  | { type: "NEXT_STEP" }
  | { type: "PREV_STEP" }
  | { type: "GO_TO_STEP"; step: number }
  | { type: "COMPLETE" }
  | { type: "RESET" }
  | { type: "LOAD_STATE"; state: DiagnosticoState };

function createInitialState(): DiagnosticoState {
  return {
    nome: "",
    currentStep: 0,
    answers: {
      P: Array(8).fill(null),
      A: Array(12).fill(null),
      G: Array(12).fill(null),
      O: Array(12).fill(null),
    },
    completed: false,
  };
}

function reducer(state: DiagnosticoState, action: DiagnosticoAction): DiagnosticoState {
  switch (action.type) {
    case "SET_NAME":
      return { ...state, nome: action.nome };
    case "SET_ANSWER": {
      const newAnswers = { ...state.answers };
      newAnswers[action.pillar] = [...newAnswers[action.pillar]];
      newAnswers[action.pillar][action.index] = action.value;
      return { ...state, answers: newAnswers };
    }
    case "NEXT_STEP":
      return { ...state, currentStep: Math.min(state.currentStep + 1, 5) };
    case "PREV_STEP":
      return { ...state, currentStep: Math.max(state.currentStep - 1, 1) };
    case "GO_TO_STEP":
      return { ...state, currentStep: action.step };
    case "COMPLETE":
      return { ...state, completed: true, currentStep: 5 };
    case "RESET": {
      localStorage.removeItem(STORAGE_KEY);
      return createInitialState();
    }
    case "LOAD_STATE":
      return action.state;
    default:
      return state;
  }
}

export function useDiagnosticoReducer() {
  const [state, dispatch] = useReducer(reducer, null, createInitialState);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as DiagnosticoState;
        dispatch({ type: "LOAD_STATE", state: parsed });
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  // Save to localStorage on state changes (skip initial/hero state)
  useEffect(() => {
    if (state.nome || state.currentStep > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch {
        // ignore storage errors
      }
    }
  }, [state]);

  const pillarAverage = useCallback(
    (pillar: PillarKey): number => {
      const answers = state.answers[pillar];
      const answered = answers.filter((a): a is number => a !== null);
      if (answered.length === 0) return 0;
      const soma = answered.reduce((sum, v) => sum + v, 0);
      // Normalize 1-4 scale to 0-10
      return parseFloat(((soma / (PILLAR_QUESTION_COUNTS[pillar] * 4)) * 10).toFixed(1));
    },
    [state.answers]
  );

  // Pillar subgroups (A, G, O — P has no subgroups)
  const pillarSubgroups = useMemo((): PillarSubgroups => {
    const calcSubgroup = (pillarAnswers: (number | null)[], start: number, count: number): number => {
      const slice = pillarAnswers.slice(start, start + count).filter((a): a is number => a !== null);
      if (slice.length === 0) return 0;
      const soma = slice.reduce((sum, v) => sum + v, 0);
      return parseFloat(((soma / (count * 4)) * 10).toFixed(1));
    };
    const a = state.answers.A;
    const g = state.answers.G;
    const o = state.answers.O;
    return {
      A: {
        vertical: calcSubgroup(a, 0, 4),    // A1-A4
        horizontal: calcSubgroup(a, 4, 4),  // A5-A8
        internal: calcSubgroup(a, 8, 4),    // A9-A12
      },
      G: {
        spiritual: calcSubgroup(g, 0, 3),   // G1-G3
        emotional: calcSubgroup(g, 3, 3),   // G4-G6
        financial: calcSubgroup(g, 6, 3),   // G7-G9
        temporal: calcSubgroup(g, 9, 3),    // G10-G12
      },
      O: {
        basic: calcSubgroup(o, 0, 4),       // O1-O4
        radical: calcSubgroup(o, 4, 4),     // O5-O8
        fruit: calcSubgroup(o, 8, 4),       // O9-O12
      },
    };
  }, [state.answers]);

  const overallAverage = useCallback((): number => {
    const averages = PILLAR_ORDER.map((p) => pillarAverage(p));
    return averages.reduce((sum, v) => sum + v, 0) / 4;
  }, [pillarAverage]);

  // Tiebreak order: G (most complex) > O > A > P (most abstract)
  const TIEBREAK_ORDER: PillarKey[] = ["G", "O", "A", "P"];

  const weakestPillar = useCallback((): PillarKey => {
    const averages = PILLAR_ORDER.map((p) => ({ p, avg: pillarAverage(p) }));
    const lowest = Math.min(...averages.map((a) => a.avg));
    const candidates = averages.filter((a) => a.avg === lowest).map((a) => a.p);
    if (candidates.length === 1) return candidates[0];
    return TIEBREAK_ORDER.find((p) => candidates.includes(p)) ?? candidates[0];
  }, [pillarAverage]);

  const weakestSubgroup = useMemo((): string | null => {
    const wp = weakestPillar();
    if (wp === "P") return null;
    const subs = pillarSubgroups[wp as "A" | "G" | "O"];
    let weakestKey: string | null = null;
    let lowest = Infinity;
    for (const [key, val] of Object.entries(subs)) {
      if ((val as number) < lowest) {
        lowest = val as number;
        weakestKey = key;
      }
    }
    return weakestKey;
  }, [weakestPillar, pillarSubgroups]);

  const weakestSubgroupPerPillar = useMemo((): Record<PillarKey, string | null> => {
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
      A: findWeakest(pillarSubgroups.A as unknown as Record<string, number>),
      G: findWeakest(pillarSubgroups.G as unknown as Record<string, number>),
      O: findWeakest(pillarSubgroups.O as unknown as Record<string, number>),
    };
  }, [pillarSubgroups]);

  const isStepComplete = useCallback(
    (step: number): boolean => {
      if (step === 0) return state.nome.trim().length >= 2;
      if (step >= 1 && step <= 4) {
        const pillar = PILLAR_ORDER[step - 1];
        return state.answers[pillar].every((a) => a !== null);
      }
      return false;
    },
    [state.nome, state.answers]
  );

  const chartData = useMemo(
    () =>
      PILLAR_ORDER.map((p) => ({
        pillar: p,
        value: Number(pillarAverage(p).toFixed(1)),
        fullMark: 10,
      })),
    [pillarAverage]
  );

  const hasSavedState = useMemo(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) !== null;
    } catch {
      return false;
    }
  }, []);

  // Get the pillar key for a given step (1-4)
  const getPillarForStep = useCallback((step: number): PillarKey | null => {
    if (step >= 1 && step <= 4) return PILLAR_ORDER[step - 1];
    return null;
  }, []);

  return {
    state,
    dispatch,
    pillarAverage,
    overallAverage,
    weakestPillar,
    weakestSubgroup,
    weakestSubgroupPerPillar,
    pillarSubgroups,
    isStepComplete,
    chartData,
    hasSavedState,
    getPillarForStep,
    PILLAR_ORDER,
  };
}
