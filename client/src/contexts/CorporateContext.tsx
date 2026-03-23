import { createContext, useContext } from "react";

export interface CorporateContextType {
  orgId: number;
  orgSlug: string;
  orgName: string;
  orgLogo: string | null;
  memberRole: "owner" | "hr_admin" | "hr_viewer" | "employee";
  memberId: number;
  isHR: boolean;
  isHRWriter: boolean;
}

export const CorporateContext = createContext<CorporateContextType | null>(null);

export function useCorporate() {
  const ctx = useContext(CorporateContext);
  if (!ctx) throw new Error("useCorporate must be used within CorporateContext");
  return ctx;
}
