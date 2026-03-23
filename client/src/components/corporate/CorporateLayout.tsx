import { type ReactNode } from "react";
import { useRoute, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { CorporateContext, type CorporateContextType } from "@/contexts/CorporateContext";
import {
  LayoutDashboard,
  ClipboardList,
  BarChart3,
  History,
  Users,
  FileText,
  Mail,
  Building2,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";

const employeeMenu = [
  { icon: LayoutDashboard, label: "Dashboard", path: "" },
  { icon: ClipboardList, label: "Diagnóstico", path: "/diagnostico" },
  { icon: BarChart3, label: "Resultados", path: "/resultados" },
  { icon: History, label: "Histórico", path: "/historico" },
];

const hrMenu = [
  { icon: LayoutDashboard, label: "Painel RH", path: "/hr" },
  { icon: Users, label: "Membros", path: "/hr/membros" },
  { icon: FileText, label: "Relatórios", path: "/hr/relatorios" },
  { icon: Mail, label: "Convites", path: "/hr/convites" },
];

export default function CorporateLayout({ children }: { children: ReactNode }) {
  const [, paramsWithRest] = useRoute("/corporate/:slug/:rest*");
  const [, paramsBase] = useRoute("/corporate/:slug");
  const slug = paramsWithRest?.slug ?? paramsBase?.slug ?? "";
  const { user, loading: authLoading, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Must check auth first
  if (!authLoading && !user) {
    window.location.href = getLoginUrl(`/corporate/${slug}`);
    return null;
  }

  const { data: membership, isLoading, error } = trpc.corporate.getMyMembership.useQuery(
    { orgSlug: slug },
    { enabled: !!slug && !!user, retry: false }
  );

  // Loading
  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-[#1A2744] flex items-center justify-center">
        <div className="space-y-3 w-64">
          <Skeleton className="h-8 w-full bg-white/10" />
          <Skeleton className="h-4 w-3/4 bg-white/10" />
          <Skeleton className="h-4 w-1/2 bg-white/10" />
        </div>
      </div>
    );
  }

  // No membership
  if (!membership) {
    return (
      <div className="min-h-screen bg-[#1A2744] flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <Building2 className="h-12 w-12 text-[#B8A88A] mx-auto" />
          <h2 className="text-xl font-semibold text-[#FAFAF8] font-[Cormorant]">Acesso Negado</h2>
          <p className="text-[#B8A88A]/70 text-sm">
            {error?.message || "Você não é membro desta organização."}
          </p>
          <button
            onClick={() => setLocation("/")}
            className="inline-block px-6 py-2 border border-[#B8A88A]/30 text-[#B8A88A] rounded-md text-sm hover:bg-[#B8A88A]/10 transition-colors"
          >
            Voltar ao Início
          </button>
        </div>
      </div>
    );
  }

  const isHR = ["owner", "hr_admin", "hr_viewer"].includes(membership.memberRole);
  const isHRWriter = ["owner", "hr_admin"].includes(membership.memberRole);
  const basePath = `/corporate/${slug}`;

  const ctx: CorporateContextType = {
    orgId: membership.orgId,
    orgSlug: membership.orgSlug,
    orgName: membership.orgName,
    orgLogo: membership.orgLogo,
    memberRole: membership.memberRole,
    memberId: membership.memberId,
    isHR,
    isHRWriter,
  };

  const renderMenuItem = (item: typeof employeeMenu[0]) => {
    const fullPath = `${basePath}${item.path}`;
    const isActive = item.path === ""
      ? location === basePath || location === `${basePath}/`
      : location.startsWith(fullPath);
    return (
      <a
        key={item.path}
        href={fullPath}
        onClick={(e) => {
          e.preventDefault();
          setLocation(fullPath);
          setMobileOpen(false);
        }}
        className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all duration-200 no-underline ${
          isActive
            ? "bg-[#B8A88A]/15 text-[#D4C8A8] font-medium border border-[#B8A88A]/20"
            : "text-[#FAFAF8]/60 hover:text-[#FAFAF8] hover:bg-white/5 border border-transparent"
        }`}
      >
        <item.icon className={`h-4 w-4 shrink-0 ${isActive ? "text-[#B8A88A]" : ""}`} />
        {item.label}
        {isActive && <ChevronRight className="h-3 w-3 ml-auto text-[#B8A88A]/50" />}
      </a>
    );
  };

  return (
    <CorporateContext.Provider value={ctx}>
      <div className="min-h-screen bg-[#0F1B2D] flex">
        {/* Sidebar */}
        <aside className={`
          fixed inset-y-0 left-0 z-40 w-64 bg-[#1A2744] border-r border-[#B8A88A]/10
          transform transition-transform duration-300 ease-in-out
          lg:relative lg:translate-x-0
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}>
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-5 border-b border-[#B8A88A]/10">
              <div className="flex items-center gap-3">
                {membership.orgLogo ? (
                  <img src={membership.orgLogo} alt="" className="h-9 w-9 rounded-full object-cover ring-2 ring-[#B8A88A]/20" />
                ) : (
                  <div className="h-9 w-9 rounded-full bg-[#B8A88A]/10 flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-[#B8A88A]" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-[#FAFAF8] truncate font-[Cormorant] text-base">{membership.orgName}</p>
                  <p className="text-[10px] uppercase tracking-[0.15em] text-[#B8A88A]/60 font-[Montserrat]">Corporativo</p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
              {isHR && (
                <p className="text-[10px] uppercase tracking-[0.15em] text-[#B8A88A]/40 font-[Montserrat] px-4 pt-3 pb-2">
                  Meu Diagnóstico
                </p>
              )}
              {employeeMenu.map(renderMenuItem)}

              {isHR && (
                <>
                  <div className="my-3 mx-4 border-t border-[#B8A88A]/10" />
                  <p className="text-[10px] uppercase tracking-[0.15em] text-[#B8A88A]/40 font-[Montserrat] px-4 pt-1 pb-2">
                    Recursos Humanos
                  </p>
                  {hrMenu.map(renderMenuItem)}
                </>
              )}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-[#B8A88A]/10">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="h-7 w-7 rounded-full bg-[#B8A88A]/10 flex items-center justify-center shrink-0">
                    <span className="text-xs text-[#B8A88A] font-medium">
                      {(user?.name || "U")[0].toUpperCase()}
                    </span>
                  </div>
                  <span className="text-xs text-[#FAFAF8]/50 truncate">{user?.name || user?.email}</span>
                </div>
                <button
                  onClick={() => { logout(); setLocation("/"); }}
                  className="text-[#FAFAF8]/30 hover:text-[#B8A88A] transition-colors"
                  title="Sair"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Mobile overlay */}
        {mobileOpen && (
          <div className="fixed inset-0 z-30 bg-black/60 lg:hidden" onClick={() => setMobileOpen(false)} />
        )}

        {/* Main content */}
        <main className="flex-1 min-w-0">
          {/* Mobile header */}
          <div className="lg:hidden flex items-center gap-3 p-4 border-b border-[#B8A88A]/10 bg-[#1A2744]">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="text-[#B8A88A] hover:text-[#D4C8A8] transition-colors"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <span className="font-semibold text-sm text-[#FAFAF8] font-[Cormorant]">{membership.orgName}</span>
          </div>

          <div className="p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </CorporateContext.Provider>
  );
}
