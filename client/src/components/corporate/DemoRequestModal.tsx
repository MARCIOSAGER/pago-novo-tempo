import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Building2, Send, CheckCircle2, Loader2 } from "lucide-react";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function DemoRequestModal({ open, onOpenChange }: Props) {
  const { t } = useLanguage();
  const d = t.corporate.demoRequest;

  const [form, setForm] = useState({
    companyName: "",
    contactName: "",
    email: "",
    phone: "",
    employeeRange: "" as "" | "1-50" | "51-200" | "201-500" | "500+",
    message: "",
  });
  const [sent, setSent] = useState(false);

  const mutation = trpc.corporate.requestDemo.useMutation({
    onSuccess: () => setSent(true),
  });

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const canSubmit =
    form.companyName.length >= 2 &&
    form.contactName.length >= 2 &&
    form.email.includes("@") &&
    form.phone.length >= 8 &&
    form.employeeRange !== "";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || mutation.isPending) return;
    mutation.mutate({
      ...form,
      employeeRange: form.employeeRange as "1-50" | "51-200" | "201-500" | "500+",
      message: form.message || undefined,
    });
  };

  const handleClose = (val: boolean) => {
    if (!val) {
      setSent(false);
      setForm({ companyName: "", contactName: "", email: "", phone: "", employeeRange: "", message: "" });
      mutation.reset();
    }
    onOpenChange(val);
  };

  const inputClass =
    "w-full bg-[#0D1520] border border-[#2A3A5C] rounded-lg px-4 py-3 text-[#FAFAF8] placeholder:text-[#5A6A8A] font-[Montserrat] text-sm focus:outline-none focus:border-[#B8A88A] transition-colors";
  const labelClass = "block text-xs font-[Montserrat] font-semibold text-[#B8A88A] uppercase tracking-wider mb-1.5";

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="bg-[#0F1B2D] border border-[#2A3A5C] text-[#FAFAF8] sm:max-w-lg max-h-[90vh] overflow-y-auto"
        showCloseButton
      >
        {sent ? (
          <div className="flex flex-col items-center py-8 gap-4 text-center">
            <div className="w-16 h-16 rounded-full bg-[#2E8B6A]/20 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-[#2E8B6A]" />
            </div>
            <h3 className="text-xl font-[Cormorant] font-bold text-[#FAFAF8]">
              {d.successTitle}
            </h3>
            <p className="text-sm text-[#FAFAF8]/60 font-[Montserrat] max-w-sm">
              {d.successMessage}
            </p>
            <button
              onClick={() => handleClose(false)}
              className="mt-4 px-6 py-2.5 bg-[#B8A88A] text-[#0F1B2D] font-[Montserrat] font-semibold text-sm rounded-lg hover:bg-[#D4C8A8] transition-colors"
            >
              {d.close}
            </button>
          </div>
        ) : (
          <>
            <DialogHeader className="text-center items-center gap-3 pb-2">
              <div className="w-12 h-12 rounded-full bg-[#B8A88A]/10 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-[#B8A88A]" />
              </div>
              <DialogTitle className="text-xl font-[Cormorant] font-bold text-[#FAFAF8]">
                {d.title}
              </DialogTitle>
              <DialogDescription className="text-sm text-[#FAFAF8]/50 font-[Montserrat]">
                {d.description}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
              <div>
                <label className={labelClass}>{d.companyName}</label>
                <input
                  type="text"
                  className={inputClass}
                  placeholder={d.companyPlaceholder}
                  value={form.companyName}
                  onChange={(e) => update("companyName", e.target.value)}
                  required
                />
              </div>

              <div>
                <label className={labelClass}>{d.contactName}</label>
                <input
                  type="text"
                  className={inputClass}
                  placeholder={d.contactPlaceholder}
                  value={form.contactName}
                  onChange={(e) => update("contactName", e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{d.email}</label>
                  <input
                    type="email"
                    className={inputClass}
                    placeholder={d.emailPlaceholder}
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className={labelClass}>{d.phone}</label>
                  <input
                    type="tel"
                    className={inputClass}
                    placeholder={d.phonePlaceholder}
                    value={form.phone}
                    onChange={(e) => update("phone", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>{d.employeeRange}</label>
                <select
                  className={`${inputClass} appearance-none`}
                  value={form.employeeRange}
                  onChange={(e) => update("employeeRange", e.target.value)}
                  required
                >
                  <option value="" disabled>{d.selectPlaceholder}</option>
                  <option value="1-50">1 – 50</option>
                  <option value="51-200">51 – 200</option>
                  <option value="201-500">201 – 500</option>
                  <option value="500+">500+</option>
                </select>
              </div>

              <div>
                <label className={labelClass}>{d.message} <span className="text-[#5A6A8A] normal-case">{d.messageOptional}</span></label>
                <textarea
                  className={`${inputClass} resize-none h-20`}
                  placeholder={d.messagePlaceholder}
                  value={form.message}
                  onChange={(e) => update("message", e.target.value)}
                  maxLength={1000}
                />
              </div>

              {mutation.isError && (
                <p className="text-sm text-red-400 font-[Montserrat] text-center">
                  {d.error}
                </p>
              )}

              <button
                type="submit"
                disabled={!canSubmit || mutation.isPending}
                className="mt-1 w-full flex items-center justify-center gap-2 bg-[#B8A88A] text-[#0F1B2D] font-[Montserrat] font-semibold text-sm uppercase tracking-wider px-6 py-3.5 rounded-lg hover:bg-[#D4C8A8] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {mutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                {mutation.isPending ? d.submitting : d.submit}
              </button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
