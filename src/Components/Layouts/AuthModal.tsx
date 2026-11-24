import React, { useEffect, useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { X, Mail, Lock, User, Phone, Eye, EyeOff, Loader2 } from "lucide-react";
import api, { errorMessage } from "../../lib/api";
import fbb from "./Img/fbb.png";

interface AuthModalProps {
  show: boolean;
  onClose: () => void;
  initialMode?: "login" | "register";
  /** Called with the email when a verification code has been sent. */
  onRegisterSuccess?: (email: string) => void;
  onLoginSuccess?: (userData: any, token: string) => Promise<void> | void;
  onForgotPassword?: () => void;
}

const inputBase =
  "w-full pl-11 pr-4 py-3 rounded-md border border-line bg-white text-ink text-sm placeholder-muted focus:outline-none focus:ring-2 focus:ring-ink/40 focus:border-ink transition disabled:bg-canvas";

const Field: React.FC<{
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}> = ({ icon, label, children }) => (
  <label className="block">
    <span className="block text-xs font-medium text-ink-soft mb-1.5">{label}</span>
    <span className="relative block">
      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none">{icon}</span>
      {children}
    </span>
  </label>
);

const AuthModal: React.FC<AuthModalProps> = ({
  show,
  onClose,
  initialMode = "login",
  onRegisterSuccess,
  onLoginSuccess,
  onForgotPassword,
}) => {
  const [isLogin, setIsLogin] = useState(initialMode === "login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!show) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && handleClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show]);

  if (!show) return null;

  const resetForm = () => {
    setPassword("");
    setConfirmPassword("");
    setError("");
    setShowPassword(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const finishLogin = async (data: any) => {
    localStorage.setItem("token", data.token);
    localStorage.setItem("userData", JSON.stringify(data.user));
    localStorage.removeItem("guestToken");
    await onLoginSuccess?.(data.user, data.token);
    resetForm();
    onClose();
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const cleanEmail = email.trim().toLowerCase();

    if (!username.trim()) return setError("Please enter your name");
    if (!/^\S+@\S+\.\S+$/.test(cleanEmail)) return setError("Please enter a valid email address");
    if (phone && phone.length < 10) return setError("Please enter a valid 10-digit phone number");
    if (password.length < 6) return setError("Password must be at least 6 characters");
    if (password !== confirmPassword) return setError("Passwords do not match");

    setIsSubmitting(true);
    try {
      const response = await api.post("/register", {
        username: username.trim(),
        email: cleanEmail,
        phone: phone.trim(),
        password,
      });
      if (response.data.success) {
        resetForm();
        onRegisterSuccess?.(cleanEmail);
      }
    } catch (err) {
      setError(errorMessage(err, "Registration failed. Please try again."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const cleanEmail = email.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(cleanEmail)) return setError("Please enter a valid email address");
    if (!password) return setError("Please enter your password");

    setIsSubmitting(true);
    try {
      const response = await api.post("/login", { email: cleanEmail, password });
      if (response.data.success) await finishLogin(response.data);
    } catch (err: any) {
      if (err?.response?.data?.requiresVerification) {
        resetForm();
        onRegisterSuccess?.(err.response.data.email || cleanEmail);
        return;
      }
      setError(errorMessage(err, "Login failed. Please check your credentials."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: { credential?: string }) => {
    setError("");
    if (!credentialResponse.credential) return setError("Google sign-in failed. Please try again.");
    setIsSubmitting(true);
    try {
      const response = await api.post("/google-auth", { credential: credentialResponse.credential });
      if (response.data.success) await finishLogin(response.data);
      else setError(response.data.message || "Google sign-in failed");
    } catch (err) {
      setError(errorMessage(err, "Google sign-in failed. Please try again."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const switchMode = (login: boolean) => {
    setIsLogin(login);
    resetForm();
  };

  const passwordToggle = (
    <button
      type="button"
      onClick={() => setShowPassword((v) => !v)}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink-soft p-1"
      aria-label={showPassword ? "Hide password" : "Show password"}
    >
      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
    </button>
  );

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center bg-stone-950/60 backdrop-blur-sm p-0 sm:p-4 animate-fade-in"
      onMouseDown={(e) => e.target === e.currentTarget && handleClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-title"
    >
      <div className="relative w-full sm:max-w-md bg-white sm:rounded-md rounded-t-2xl shadow-2xl max-h-[95vh] overflow-y-auto">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center text-muted hover:bg-canvas hover:text-ink transition"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="px-6 sm:px-8 pt-8 pb-6">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="h-12 w-20 rounded-md bg-stone-950 flex items-center justify-center mb-4">
              <img src={fbb} alt="FBB Store" className="h-9 w-auto object-contain" />
            </div>
            <h2 id="auth-title" className="font-display text-2xl text-ink">
              {isLogin ? "Welcome back" : "Create your account"}
            </h2>
            <p className="text-sm text-muted mt-1">
              {isLogin ? "Sign in to checkout faster and track orders" : "Join FBB Store in less than a minute"}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-1 p-1 mb-6 rounded-md bg-canvas" role="tablist">
            {[
              { label: "Sign in", active: isLogin, onClick: () => switchMode(true) },
              { label: "Register", active: !isLogin, onClick: () => switchMode(false) },
            ].map((tab) => (
              <button
                key={tab.label}
                role="tab"
                aria-selected={tab.active}
                onClick={tab.onClick}
                className={`py-2.5 text-sm font-semibold rounded-lg transition ${
                  tab.active ? "bg-white text-ink shadow-sm" : "text-muted hover:text-ink"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-md bg-sale-soft border border-red-200 text-sm text-sale" role="alert">
              {error}
            </div>
          )}

          {isLogin ? (
            <form onSubmit={handleLogin} className="space-y-4" noValidate>
              <Field icon={<Mail className="w-4 h-4" />} label="Email">
                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputBase}
                  placeholder="you@example.com"
                  disabled={isSubmitting}
                  autoFocus
                />
              </Field>
              <Field icon={<Lock className="w-4 h-4" />} label="Password">
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${inputBase} pr-11`}
                  placeholder="Your password"
                  disabled={isSubmitting}
                />
                {passwordToggle}
              </Field>

              {onForgotPassword && (
                <div className="flex justify-end -mt-1">
                  <button
                    type="button"
                    onClick={onForgotPassword}
                    className="text-xs font-medium text-ink hover:text-ink hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-md bg-ink text-white font-semibold text-sm hover:bg-black transition flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {isSubmitting ? "Signing in…" : "Sign in"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4" noValidate>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field icon={<User className="w-4 h-4" />} label="Full name">
                  <input
                    type="text"
                    autoComplete="name"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className={inputBase}
                    placeholder="Your name"
                    disabled={isSubmitting}
                    autoFocus
                  />
                </Field>
                <Field icon={<Phone className="w-4 h-4" />} label="Phone (optional)">
                  <input
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 15))}
                    className={inputBase}
                    placeholder="10-digit mobile"
                    disabled={isSubmitting}
                  />
                </Field>
              </div>
              <Field icon={<Mail className="w-4 h-4" />} label="Email">
                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputBase}
                  placeholder="you@example.com"
                  disabled={isSubmitting}
                />
              </Field>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field icon={<Lock className="w-4 h-4" />} label="Password">
                  <input
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`${inputBase} pr-11`}
                    placeholder="Min. 6 characters"
                    disabled={isSubmitting}
                  />
                  {passwordToggle}
                </Field>
                <Field icon={<Lock className="w-4 h-4" />} label="Confirm password">
                  <input
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={inputBase}
                    placeholder="Repeat password"
                    disabled={isSubmitting}
                  />
                </Field>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-md bg-ink text-white font-semibold text-sm hover:bg-black transition flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {isSubmitting ? "Creating account…" : "Create account"}
              </button>
              <p className="text-xs text-muted text-center">We'll email you a 6-digit code to verify your address.</p>
            </form>
          )}

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-line" />
            <span className="text-xs text-muted">or continue with</span>
            <div className="flex-1 h-px bg-line" />
          </div>

          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError("Google sign-in was cancelled or failed.")}
              useOneTap={false}
              shape="pill"
              text={isLogin ? "signin_with" : "signup_with"}
              width="320"
            />
          </div>

          <p className="text-center text-xs mt-6 text-muted">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
