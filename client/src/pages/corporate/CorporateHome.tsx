import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { Building2, ArrowRight, LogIn } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function CorporateHome() {
  const { user, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  const [, setLocation] = useLocation();

  const { data: orgs, isLoading } = trpc.corporate.myOrgs.useQuery(undefined, {
    enabled: !!user,
  });

  // If user has exactly one org, redirect directly
  if (orgs && orgs.length === 1) {
    setLocation(`/corporate/${orgs[0].orgSlug}`);
    return null;
  }

  const c = t.corporate.home;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-navy pt-28 pb-16 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <Building2 className="w-12 h-12 text-gold mx-auto mb-4" />
            <h1 className="font-display text-3xl text-warm-white mb-3">
              {c.title}
            </h1>
            <p className="text-warm-white/60 font-body">
              {c.subtitle}
            </p>
          </div>

          {authLoading || isLoading ? (
            <div className="flex justify-center">
              <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
            </div>
          ) : !user ? (
            <div className="bg-navy-light/50 border border-gold/10 rounded-xl p-8 text-center">
              <p className="text-warm-white/70 mb-6">
                {c.loginPrompt}
              </p>
              <a
                href="/api/oauth/google?returnTo=/corporate"
                className="inline-flex items-center gap-2 bg-gold/10 text-gold border border-gold/30 px-6 py-3 rounded-lg hover:bg-gold/20 transition-colors font-accent text-sm uppercase tracking-wider"
              >
                <LogIn className="w-4 h-4" />
                {c.loginButton}
              </a>
            </div>
          ) : orgs && orgs.length > 0 ? (
            <div className="space-y-4">
              {orgs.map((org: { orgId: number; orgName: string; orgSlug: string; orgLogo: string | null; memberRole: string }) => (
                <button
                  key={org.orgId}
                  onClick={() => setLocation(`/corporate/${org.orgSlug}`)}
                  className="w-full flex items-center justify-between bg-navy-light/50 border border-gold/10 rounded-xl p-6 hover:border-gold/30 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    {org.orgLogo ? (
                      <img src={org.orgLogo} alt={org.orgName} className="w-12 h-12 rounded-lg object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-gold/10 flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-gold" />
                      </div>
                    )}
                    <div className="text-left">
                      <p className="font-display text-lg text-warm-white">{org.orgName}</p>
                      <p className="text-warm-white/50 text-sm capitalize">{org.memberRole.replace("_", " ")}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gold/50 group-hover:text-gold transition-colors" />
                </button>
              ))}
            </div>
          ) : (
            <div className="bg-navy-light/50 border border-gold/10 rounded-xl p-8 text-center">
              <p className="text-warm-white/70">
                {c.noOrgs}
              </p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
