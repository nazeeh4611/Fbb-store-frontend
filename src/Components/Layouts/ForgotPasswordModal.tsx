import React, { useEffect, useState } from "react";
import { X, Mail, KeyRound, Lock, Loader2, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { toast } from "react-hot-toast";
import api, { errorMessage } from "../../lib/api";
import { openAuthModal } from "../../lib/auth";

interface ForgotPasswordModalProps {
  show: boolean;
  onClose: () => void;
}

type Step = "email" | "reset" | "done";

const input =
  "w-full pl-11 pr-4 py-3 rounded-xl border border-stone-300 bg-white text-stone-900 text-sm placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition";

/** Two-step password reset: email -> 6-digit code + new password. */
const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ show, onClose }) => {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendIn, setResendIn] = useState(0);

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  useEffect(() => {
    if (!show) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show]);

  if (!show) return null;

  const close = () => {
    setStep("email");
    setCode("");
    setPassword("");
    setError("");
    onClose();
  };

  const sendCode = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError("");
    const clean = email.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(clean)) return setError("Please enter a valid email address");
    setLoading(true);
    try {
      await api.post("/forgot-password", { email: clean });
      setStep("reset");
      setResendIn(30);
      toast.success("If that email is registered, a code is on its way");
    } catch (err) {
      setError(errorMessage(err, "Couldn't send the code. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!/^\d{6}$/.test(code)) return setError("Enter the 6-digit code from your email");
    if (password.length < 6) return setError("Password must be at least 6 characters");
    setLoading(true);
    try {
      await api.post("/reset-password", { email: email.trim().toLowerCase(), otp: code, newPassword: password });
      setStep("done");
    } catch (err) {
      setError(errorMessage(err, "Couldn't reset your password. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center bg-stone-950/60 backdrop-blur-sm p-0 sm:p-4 animate-fade-in"
      onMouseDown={(e) => e.target === e.currentTarget && close()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="forgot-title"
    >
      <div className="relative w-full sm:max-w-sm bg-white sm:rounded-2xl rounded-t-2xl shadow-2xl p-6 sm:p-8">
        <button
          onClick={close}
          className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center text-stone-500 hover:bg-stone-100 hover:text-stone-900 transition"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {step === "done" ? (
          <div className="text-center py-4">
            <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto mb-4" />
            <h2 id="forgot-title" className="font-serif text-2xl text-stone-900 mb-2">Password updated</h2>
            <p className="text-sm text-stone-500 mb-6">You can now sign in with your new password.</p>
            <button
              onClick={() => {
                close();
                openAuthModal("login");
              }}
              className="w-full py-3 rounded-xl bg-stone-900 text-white font-semibold text-sm hover:bg-stone-800 transition"
            >
              Sign in
            </button>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <div className="h-11 w-11 rounded-full bg-amber-50 flex items-center justify-center mb-4">
                <KeyRound className="w-5 h-5 text-amber-600" />
              </div>
              <h2 id="forgot-title" className="font-serif text-2xl text-stone-900">
                {step === "email" ? "Reset your password" : "Check your email"}
              </h2>
              <p className="text-sm text-stone-500 mt-1">
                {step === "email"
                  ? "Enter your account email and we'll send you a 6-digit code."
                  : <>We sent a code to <span className="font-medium text-stone-800">{email}</span>.</>}
              </p>
            </div>

            {error && (
              <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700" role="alert">
                {error}
              </div>
            )}

            {step === "email" ? (
              <form onSubmit={sendCode} className="space-y-4" noValidate>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={input}
                    placeholder="you@example.com"
                    autoFocus
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-stone-900 text-white font-semibold text-sm hover:bg-stone-800 transition flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Send code
                </button>
              </form>
            ) : (
              <form onSubmit={resetPassword} className="space-y-4" noValidate>
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  className="w-full py-3 rounded-xl border border-stone-300 text-center text-2xl tracking-[0.5em] font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500"
                  placeholder="••••••"
                  aria-label="6-digit code"
                  autoFocus
                />
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`${input} pr-11`}
                    placeholder="New password (min. 6 characters)"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-1"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-stone-900 text-white font-semibold text-sm hover:bg-stone-800 transition flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Update password
                </button>
                <div className="flex items-center justify-between text-xs">
                  <button type="button" onClick={() => setStep("email")} className="text-stone-500 hover:text-stone-800">
                    Change email
                  </button>
                  <button
                    type="button"
                    disabled={resendIn > 0 || loading}
                    onClick={() => sendCode()}
                    className="font-medium text-amber-700 hover:text-amber-800 disabled:text-stone-400"
                  >
                    {resendIn > 0 ? `Resend in ${resendIn}s` : "Resend code"}
                  </button>
                </div>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordModal;
