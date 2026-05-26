import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Send, Loader2, CheckCircle2 } from "lucide-react";

type EmployeeRange = "1-50" | "51-200" | "201-500" | "500+";

const tamanhoToRange: Record<string, EmployeeRange> = {
  t1: "51-200",
  t2: "201-500",
  t3: "500+",
  t4: "500+",
};

export default function B2BQualificationForm() {
  const { t } = useLanguage();
  const f = t.corporate.home.qualForm;

  const [step, setStep] = useState<1 | 2>(1);
  const [tamanhoKey, setTamanhoKey] = useState<"" | "t1" | "t2" | "t3" | "t4">("");
  const [desafioKey, setDesafioKey] = useState<"" | "d1" | "d2" | "d3" | "d4">("");
  const [nome, setNome] = useState("");
  const [cargoKey, setCargoKey] = useState<"" | "c1" | "c2" | "c3" | "c4">("");
  const [empresa, setEmpresa] = useState("");
  const [email, setEmail] = useState("");

  const mutation = trpc.corporate.requestDemo.useMutation();
  const sent = mutation.isSuccess;

  const desafioLabel: Record<string, string> = {
    d1: f.desafio1, d2: f.desafio2, d3: f.desafio3, d4: f.desafio4,
  };
  const cargoLabel: Record<string, string> = {
    c1: f.cargo1, c2: f.cargo2, c3: f.cargo3, c4: f.cargo4,
  };

  const canStep1 = tamanhoKey !== "" && desafioKey !== "";
  const canStep2 = nome.length >= 2 && cargoKey !== "" && empresa.length >= 2 && email.includes("@");

  const handleNext = () => {
    if (canStep1) setStep(2);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canStep2 || mutation.isPending) return;
    const employeeRange = tamanhoToRange[tamanhoKey] ?? "500+";
    const msg = `${f.desafioLabel}: ${desafioLabel[desafioKey] ?? ""} | ${f.cargoLabel}: ${cargoLabel[cargoKey] ?? ""}`;
    mutation.mutate({
      companyName: empresa,
      contactName: nome,
      email,
      phone: "n/a",
      employeeRange,
      message: msg,
    });
  };

  const inputClass =
    "w-full bg-[#0B1120] border border-[#C9A84C]/15 rounded-lg px-4 py-3 text-[#FAFAF8] placeholder:text-[#FAFAF8]/30 font-[Montserrat] text-sm focus:outline-none focus:border-[#C9A84C]/50 transition-colors";
  const labelClass = "block text-xs font-[Montserrat] font-semibold text-[#C9A84C]/90 uppercase tracking-wider mb-2";

  if (sent) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xl mx-auto bg-[#0F1B2D]/70 border border-[#C9A84C]/30 rounded-2xl p-10 text-center"
      >
        <div className="w-14 h-14 mx-auto rounded-full bg-[#2E8B6A]/15 flex items-center justify-center mb-4">
          <CheckCircle2 className="w-7 h-7 text-[#2E8B6A]" />
        </div>
        <p className="font-[Montserrat] text-sm text-[#FAFAF8]/80 leading-relaxed">
          {f.successMsg}
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      id="form-qualificacao"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5 }}
      className="max-w-2xl mx-auto bg-[#0F1B2D]/70 border border-[#C9A84C]/20 rounded-2xl p-8 sm:p-10"
    >
      {/* Step header */}
      <div className="flex items-center justify-between mb-8">
        <p className="font-[Montserrat] text-xs uppercase tracking-[0.2em] text-[#C9A84C]">
          {step === 1 ? f.step1Label : f.step2Label}
        </p>
        <div className="flex items-center gap-1.5">
          <span className={`w-8 h-1 rounded-full ${step >= 1 ? "bg-[#C9A84C]" : "bg-[#FAFAF8]/15"}`} />
          <span className={`w-8 h-1 rounded-full ${step >= 2 ? "bg-[#C9A84C]" : "bg-[#FAFAF8]/15"}`} />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 ? (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col gap-6"
          >
            <div>
              <label className={labelClass}>{f.tamanhoLabel}</label>
              <select
                className={`${inputClass} appearance-none`}
                value={tamanhoKey}
                onChange={(e) => setTamanhoKey(e.target.value as typeof tamanhoKey)}
              >
                <option value="" disabled>{f.tamanhoPlaceholder}</option>
                <option value="t1">{f.tamanho1}</option>
                <option value="t2">{f.tamanho2}</option>
                <option value="t3">{f.tamanho3}</option>
                <option value="t4">{f.tamanho4}</option>
              </select>
            </div>

            <div>
              <label className={labelClass}>{f.desafioLabel}</label>
              <select
                className={`${inputClass} appearance-none`}
                value={desafioKey}
                onChange={(e) => setDesafioKey(e.target.value as typeof desafioKey)}
              >
                <option value="" disabled>{f.desafioPlaceholder}</option>
                <option value="d1">{f.desafio1}</option>
                <option value="d2">{f.desafio2}</option>
                <option value="d3">{f.desafio3}</option>
                <option value="d4">{f.desafio4}</option>
              </select>
            </div>

            <button
              type="button"
              onClick={handleNext}
              disabled={!canStep1}
              className="mt-2 w-full flex items-center justify-center gap-2 bg-[#C9A84C] text-[#0B1120] font-[Montserrat] font-semibold text-sm uppercase tracking-wider px-6 py-3.5 rounded-lg hover:bg-[#D4B86A] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {f.continuar}
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        ) : (
          <motion.form
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            onSubmit={handleSubmit}
            className="flex flex-col gap-5"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>{f.nomeLabel}</label>
                <input
                  type="text"
                  className={inputClass}
                  placeholder={f.nomePlaceholder}
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className={labelClass}>{f.cargoLabel}</label>
                <select
                  className={`${inputClass} appearance-none`}
                  value={cargoKey}
                  onChange={(e) => setCargoKey(e.target.value as typeof cargoKey)}
                  required
                >
                  <option value="" disabled>{f.cargoPlaceholder}</option>
                  <option value="c1">{f.cargo1}</option>
                  <option value="c2">{f.cargo2}</option>
                  <option value="c3">{f.cargo3}</option>
                  <option value="c4">{f.cargo4}</option>
                </select>
              </div>
            </div>

            <div>
              <label className={labelClass}>{f.empresaLabel}</label>
              <input
                type="text"
                className={inputClass}
                placeholder={f.empresaPlaceholder}
                value={empresa}
                onChange={(e) => setEmpresa(e.target.value)}
                required
              />
            </div>

            <div>
              <label className={labelClass}>{f.emailLabel}</label>
              <input
                type="email"
                className={inputClass}
                placeholder={f.emailPlaceholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {mutation.isError && (
              <p className="text-sm text-red-400 font-[Montserrat] text-center">
                {f.errorMsg}
              </p>
            )}

            <div className="flex gap-3 mt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-5 py-3.5 border border-[#C9A84C]/25 text-[#FAFAF8]/70 font-[Montserrat] text-sm uppercase tracking-wider rounded-lg hover:bg-[#FAFAF8]/5 transition-colors flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                {f.voltar}
              </button>
              <button
                type="submit"
                disabled={!canStep2 || mutation.isPending}
                className="flex-1 flex items-center justify-center gap-2 bg-[#C9A84C] text-[#0B1120] font-[Montserrat] font-semibold text-sm uppercase tracking-wider px-6 py-3.5 rounded-lg hover:bg-[#D4B86A] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {mutation.isPending ? f.enviando : f.enviar}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
