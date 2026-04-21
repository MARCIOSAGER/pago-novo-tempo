import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, CheckCircle2, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ConsultarPedidos() {
  const { t } = useLanguage();
  const copy = t.orders.lookup;

  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const send = trpc.purchases.sendLookupLink.useMutation({
    onSuccess: () => setSubmitted(true),
    onError: (e) => setErrorMsg(e.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) {
      setErrorMsg(copy.invalidEmail);
      return;
    }
    setErrorMsg(null);
    send.mutate({ email: email.trim().toLowerCase() });
  };

  return (
    <div className="min-h-screen bg-warm-white flex flex-col">
      <Navbar />
      <main className="flex-1 py-16 lg:py-24">
        <div className="max-w-xl mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center mb-10">
              <p className="font-accent text-[11px] uppercase tracking-[0.4em] text-gold mb-4">
                P.A.G.O.
              </p>
              <h1 className="font-display text-3xl lg:text-4xl font-semibold text-navy leading-tight mb-3">
                {copy.title}
              </h1>
              <div className="w-12 h-[1px] bg-gold mx-auto mb-4" />
              <p className="font-body text-sm text-navy/70">
                {copy.subtitle}
              </p>
            </div>

            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="border border-emerald-200 bg-emerald-50 rounded p-8 text-center"
              >
                <CheckCircle2 className="h-12 w-12 text-emerald-600 mx-auto mb-4" strokeWidth={1.5} />
                <h2 className="font-display text-xl font-semibold text-navy mb-3">
                  {copy.sentTitle}
                </h2>
                <p className="font-body text-sm text-navy/70 mb-2 max-w-md mx-auto">
                  {copy.sentMessage.replace("{email}", email)}
                </p>
                <p className="font-body text-xs text-navy/50 max-w-md mx-auto">
                  {copy.sentTip}
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5 border border-navy/10 bg-white p-6 lg:p-8">
                <div>
                  <Label htmlFor="email" className="font-accent text-xs uppercase tracking-[0.15em] text-navy mb-2 block">
                    {copy.emailLabel}
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    required
                    autoFocus
                    maxLength={320}
                  />
                  <p className="text-xs text-navy/50 mt-1.5">{copy.emailHelp}</p>
                </div>

                {errorMsg && (
                  <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded p-3">
                    {errorMsg}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={send.isPending || !email.includes("@")}
                  className="w-full btn-shine font-accent text-xs uppercase tracking-[0.2em] bg-navy text-warm-white px-8 py-4 hover:bg-navy-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                >
                  <Mail className="h-3.5 w-3.5" />
                  {send.isPending ? copy.sending : copy.sendLink}
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>

                <div className="pt-4 border-t border-navy/10 text-xs text-navy/60 space-y-1.5">
                  <p className="font-semibold text-navy/80">{copy.howItWorks}</p>
                  <ul className="list-disc list-inside space-y-0.5">
                    <li>{copy.step1}</li>
                    <li>{copy.step2}</li>
                    <li>{copy.step3}</li>
                  </ul>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
