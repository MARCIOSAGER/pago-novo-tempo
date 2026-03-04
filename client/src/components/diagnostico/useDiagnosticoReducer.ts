import { useReducer, useEffect, useCallback, useMemo } from "react";

export type PillarKey = "P" | "A" | "G" | "O";

const PILLAR_QUESTION_COUNTS: Record<PillarKey, number> = {
  P: 8,
  A: 12,
  G: 15,
  O: 9,
};

const PILLAR_ORDER: PillarKey[] = ["P", "A", "G", "O"];

const STORAGE_KEY = "pago-diagnostico-state";

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
      G: Array(15).fill(null),
      O: Array(9).fill(null),
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

export interface StatusInfo {
  label: string;
  color: string;
  key: "solid" | "building" | "fragile" | "collapse";
}

export function getStatusInfo(media: number): StatusInfo {
  if (media >= 8) return { label: "solid", color: "#2E5E3E", key: "solid" };
  if (media >= 5) return { label: "building", color: "#B8A88A", key: "building" };
  if (media >= 3) return { label: "fragile", color: "#8B6914", key: "fragile" };
  return { label: "collapse", color: "#7A3030", key: "collapse" };
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
      return answered.reduce((sum, v) => sum + v, 0) / PILLAR_QUESTION_COUNTS[pillar];
    },
    [state.answers]
  );

  const overallAverage = useCallback((): number => {
    const averages = PILLAR_ORDER.map((p) => pillarAverage(p));
    return averages.reduce((sum, v) => sum + v, 0) / 4;
  }, [pillarAverage]);

  const weakestPillar = useCallback((): PillarKey => {
    let weakest: PillarKey = "P";
    let lowest = Infinity;
    for (const p of PILLAR_ORDER) {
      const avg = pillarAverage(p);
      if (avg < lowest) {
        lowest = avg;
        weakest = p;
      }
    }
    return weakest;
  }, [pillarAverage]);

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
    isStepComplete,
    chartData,
    hasSavedState,
    getPillarForStep,
    PILLAR_ORDER,
  };
}
