import { type ReactNode } from "react";
import { useRoute, useLocation, Link } from "wouter";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
  const [, params] = useRoute("/corporate/:slug/:rest*");
  const slug = params?.slug ?? "";
  const { user, loading: authLoading, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const { data: membership, isLoading } = trpc.corporate.getMyMembership.useQuery(
    { orgSlug: slug },
    { enabled: !!slug && !!user }
  );

  // Loading
  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="space-y-3 w-64">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    window.location.href = getLoginUrl(`/corporate/${slug}`);
    return null;
  }

  // No membership data
  if (!membership) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <Building2 className="h-12 w-12 text-muted-foreground mx-auto" />
          <h2 className="text-xl font-semibold">Acesso Negado</h2>
          <p className="text-muted-foreground text-sm">Você não é membro desta organização.</p>
          <Button variant="outline" onClick={() => setLocation("/")}>Voltar ao Início</Button>
        </div>
      </div>
    );
  }

  const isHR = ["owner", "hr_admin", "hr_viewer"].includes(membership.memberRole);
  const isHRWriter = ["owner", "hr_admin"].includes(membership.memberRole);
  const basePath = `/corporate/${slug}`;
  const menuItems = [...employeeMenu, ...(isHR ? hrMenu : [])];

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

  return (
    <CorporateContext.Provider value={ctx}>
      <div className="min-h-screen bg-background flex">
        {/* Sidebar */}
        <aside className={`
          fixed inset-y-0 left-0 z-40 w-64 bg-sidebar border-r transform transition-transform
          lg:relative lg:translate-x-0
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}>
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b">
              <div className="flex items-center gap-3">
                {membership.orgLogo ? (
                  <img src={membership.orgLogo} alt="" className="h-8 w-8 rounded-full object-cover" />
                ) : (
                  <Building2 className="h-6 w-6 text-muted-foreground" />
                )}
                <div className="min-w-0">
                  <p className="font-semibold text-sm truncate">{membership.orgName}</p>
                  <p className="text-xs text-muted-foreground">Corporativo</p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
              {isHR && (
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground px-3 pt-2 pb-1">
                  Meu Diagnóstico
                </p>
              )}
              {employeeMenu.map((item) => {
                const fullPath = `${basePath}${item.path}`;
                const isActive = item.path === ""
                  ? location === basePath || location === `${basePath}/`
                  : location.startsWith(fullPath);
                return (
                  <Link key={item.path} href={fullPath}>
                    <button
                      onClick={() => setMobileOpen(false)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                          : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                      }`}
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {item.label}
                    </button>
                  </Link>
                );
              })}

              {isHR && (
                <>
                  <div className="my-2 border-t" />
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground px-3 pt-1 pb-1">
                    Recursos Humanos
                  </p>
                  {hrMenu.map((item) => {
                    const fullPath = `${basePath}${item.path}`;
                    const isActive = location.startsWith(fullPath);
                    return (
                      <Link key={item.path} href={fullPath}>
                        <button
                          onClick={() => setMobileOpen(false)}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                            isActive
                              ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                              : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                          }`}
                        >
                          <item.icon className="h-4 w-4 shrink-0" />
                          {item.label}
                        </button>
                      </Link>
                    );
                  })}
                </>
              )}
            </nav>

            {/* Footer */}
            <div className="p-3 border-t">
              <div className="flex items-center justify-between px-3 py-2">
                <span className="text-xs text-muted-foreground truncate">{user.name || user.email}</span>
                <button onClick={() => { logout(); setLocation("/"); }} className="text-muted-foreground hover:text-foreground">
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Mobile overlay */}
        {mobileOpen && (
          <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setMobileOpen(false)} />
        )}

        {/* Main content */}
        <main className="flex-1 min-w-0">
          {/* Mobile header */}
          <div className="lg:hidden flex items-center gap-3 p-4 border-b">
            <Button variant="ghost" size="icon" onClick={() => setMobileOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
            <span className="font-semibold text-sm">{membership.orgName}</span>
          </div>

          <div className="p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </CorporateContext.Provider>
  );
}
