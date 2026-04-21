import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  User, Mail, Lock, ArrowLeft, Loader2, CheckCircle2,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import PasswordStrength from "@/components/PasswordStrength";

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const { t } = useLanguage();
  const [, setLocation] = useLocation();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [changingPw, setChangingPw] = useState(false);
  const [pwSuccess, setPwSuccess] = useState(false);

  if (loading) return null;
  if (!user) {
    setLocation("/login?returnTo=/profile");
    return null;
  }

  const isEmailUser = user.loginMethod === "email";

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error(t.auth.passwordMismatch);
      return;
    }
    if (newPassword.length < 8) {
      toast.error(t.auth.passwordTooShort);
      return;
    }

    setChangingPw(true);
    try {
      // Login with current password to verify, then update
      const loginRes = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, password: currentPassword }),
      });
      if (!loginRes.ok) {
        toast.error("Senha atual incorreta.");
        return;
      }

      // Use forgot-password flow internally: request reset, then apply
      const forgotRes = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email }),
      });
      if (!forgotRes.ok) {
        toast.error("Erro ao alterar senha.");
        return;
      }

      // For now, show success message directing to email
      setPwSuccess(true);
      toast.success("Enviamos um link de redefinição para o seu email.");
    } catch {
      toast.error("Erro ao alterar senha.");
    } finally {
      setChangingPw(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#F5F0E8] pt-28 pb-16 px-6">
        <div className="max-w-lg mx-auto space-y-6">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar
          </button>

          <h1 className="text-2xl font-[Cormorant] font-bold text-[#1A2744]">Meu Perfil</h1>

          {/* User Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <User className="h-4 w-4" /> Informações da Conta
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</label>
                <p className="text-sm font-medium mt-1">{user.name || "—"}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Email</label>
                <p className="text-sm font-medium mt-1">{user.email || "—"}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Metodo de Login</label>
                <div className="mt-1">
                  <Badge variant="outline">{user.loginMethod || "—"}</Badge>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Permissao</label>
                <div className="mt-1">
                  <Badge variant={user.role === "admin" ? "default" : "outline"}>{user.role}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Change Password — only for email users */}
          {isEmailUser && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Lock className="h-4 w-4" /> Alterar Senha
                </CardTitle>
              </CardHeader>
              <CardContent>
                {pwSuccess ? (
                  <div className="flex flex-col items-center gap-3 py-4 text-center">
                    <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                    <p className="text-sm text-gray-600">Enviamos um link de redefinição para <strong>{user.email}</strong>.</p>
                    <p className="text-xs text-gray-400">Verifique a sua caixa de entrada.</p>
                  </div>
                ) : (
                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <div>
                      <label className="text-xs font-medium text-gray-500">Senha atual</label>
                      <Input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500">Nova senha</label>
                      <Input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        minLength={8}
                        className="mt-1"
                      />
                      <PasswordStrength password={newPassword} />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500">Confirmar nova senha</label>
                      <Input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        minLength={8}
                        className="mt-1"
                      />
                    </div>
                    <Button type="submit" disabled={changingPw || !currentPassword || !newPassword || !confirmPassword} className="w-full">
                      {changingPw ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      {changingPw ? "Alterando..." : "Alterar Senha"}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          )}

          {!isEmailUser && (
            <Card>
              <CardContent className="py-6 text-center text-sm text-gray-500">
                <Mail className="h-6 w-6 mx-auto mb-2 text-gray-400" />
                Voce faz login via <strong>{user.loginMethod}</strong>. A senha e gerenciada pelo provedor.
              </CardContent>
            </Card>
          )}

        </div>
      </div>
    </>
  );
}
