import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff, MailCheck, RefreshCw } from "lucide-react";
import useUserService from "../../service/user-api-service/UserService";
import useAuth from "../../Hooks/useAuth";

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setAuth } = useAuth();
  const { registerAPI, verifyEmailAPI, resendVerificationAPI } = useUserService();

  const initialPendingEmail = location.state?.verifyEmail || "";
  const [step, setStep] = useState(initialPendingEmail ? "verify" : "register");
  const [pendingEmail, setPendingEmail] = useState(initialPendingEmail);
  const [verificationCode, setVerificationCode] = useState("");
  const [resendCooldown, setResendCooldown] = useState(initialPendingEmail ? 0 : 30);
  const [resending, setResending] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmpassword: "",
  });

  useEffect(() => {
    if (resendCooldown <= 0) return undefined;
    const timer = setTimeout(() => setResendCooldown((prev) => Math.max(0, prev - 1)), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (form.password !== form.confirmpassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (submitting) return;
    try {
      setSubmitting(true);
      const res = await registerAPI(form);
      if (res.status === 201 || res.data?.requiresVerification) {
        const targetEmail = res.data?.email || form.email.trim().toLowerCase();
        setPendingEmail(targetEmail);
        setVerificationCode("");
        setStep("verify");
        setResendCooldown(30);
        toast.success("Verification code sent to your email!");
      }
    } catch (error) {
      const message = error.response?.data?.message || "Registration failed";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    const cleaned = verificationCode.replace(/\D/g, "").slice(0, 6);
    if (cleaned.length !== 6) {
      toast.error("Please enter the 6-digit verification code");
      return;
    }

    if (submitting) return;
    try {
      setSubmitting(true);
      const res = await verifyEmailAPI({ email: pendingEmail, code: cleaned });
      if (res?.success && res?.token && res?.data) {
        localStorage.setItem("token", res.token);
        localStorage.setItem("role", res.data.role);
        localStorage.setItem("name", res.data.name);
        localStorage.setItem("email", res.data.email);
        setAuth({
          token: res.token,
          role: res.data.role,
          name: res.data.name,
          email: res.data.email,
        });
        toast.success("Account verified! Welcome to Fragranzia.");
        navigate("/", { replace: true });
      } else {
        toast.success(res?.message || "Email verified! Please sign in.");
        navigate("/login", { replace: true });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid or expired verification code");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    if (!pendingEmail || resendCooldown > 0 || resending) return;
    try {
      setResending(true);
      const res = await resendVerificationAPI({ email: pendingEmail });
      setResendCooldown(30);
      toast.success(res?.message || "A new verification code has been sent.");
    } catch (error) {
      const retryAfter = error.response?.data?.retryAfterSeconds;
      if (retryAfter) setResendCooldown(retryAfter);
      toast.error(error.response?.data?.message || "Unable to resend verification code");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f1f3f6] flex flex-col justify-center items-center px-4 py-8 text-slate-900">
      <div className="w-full max-w-md space-y-4">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#0d2a46] transition"
        >
          <ArrowLeft size={14} /> Back to Store
        </Link>

        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="bg-[#0d2a46] px-6 py-5 text-white">
            <p className="text-xs font-semibold uppercase tracking-wider text-sky-200">
              Fragranzia
            </p>
            <h1 className="text-xl font-bold mt-1">
              {step === "verify" ? "Verify your email" : "Create your account"}
            </h1>
            <p className="text-xs text-slate-200 mt-0.5">
              {step === "verify"
                ? `Enter the 6-digit verification code sent to ${pendingEmail}`
                : "Fast checkout, saved addresses, and easy order tracking"}
            </p>
          </div>

          {step === "verify" ? (
            <form onSubmit={handleVerifySubmit} className="p-6 space-y-4">
              <div className="flex items-start gap-2.5 p-3 rounded-lg bg-sky-50 border border-sky-200 text-xs text-sky-900">
                <MailCheck size={16} className="shrink-0 mt-0.5 text-[#0d2a46]" />
                <p>
                  We sent a 6-digit verification code to{" "}
                  <strong className="font-semibold">{pendingEmail}</strong>. Check your inbox or
                  spam folder (valid for 10 minutes).
                </p>
              </div>

              <div>
                <label
                  htmlFor="reg-otp"
                  className="block text-xs font-semibold text-slate-700 mb-1.5"
                >
                  Verification Code
                </label>
                <input
                  id="reg-otp"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="Enter 6-digit code"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-center font-mono text-lg tracking-[0.4em] focus:border-[#0d2a46] outline-none transition"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submitting || verificationCode.length !== 6}
                className="w-full bg-[#0d2a46] text-white py-2.5 rounded-lg text-sm font-bold hover:bg-[#163d61] transition disabled:opacity-60"
              >
                {submitting ? "Verifying..." : "Verify & Activate Account"}
              </button>

              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={resendCooldown > 0 || resending}
                  className="inline-flex items-center gap-1 font-semibold text-[#2874f0] hover:underline disabled:opacity-50 disabled:no-underline"
                >
                  <RefreshCw size={12} className={resending ? "animate-spin" : ""} />
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend verification code"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStep("register");
                    setVerificationCode("");
                  }}
                  className="font-semibold text-slate-600 hover:text-slate-900"
                >
                  Change email
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label
                  htmlFor="reg-name"
                  className="block text-xs font-semibold text-slate-700 mb-1.5"
                >
                  Full Name
                </label>
                <input
                  id="reg-name"
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:border-[#0d2a46] outline-none transition"
                  minLength={3}
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="reg-email"
                  className="block text-xs font-semibold text-slate-700 mb-1.5"
                >
                  Email Address
                </label>
                <input
                  id="reg-email"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:border-[#0d2a46] outline-none transition"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="reg-password"
                  className="block text-xs font-semibold text-slate-700 mb-1.5"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="reg-password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="At least 6 characters"
                    className="w-full px-3.5 py-2.5 pr-10 border border-slate-300 rounded-lg text-sm focus:border-[#0d2a46] outline-none transition"
                    minLength={6}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="reg-confirm"
                  className="block text-xs font-semibold text-slate-700 mb-1.5"
                >
                  Confirm Password
                </label>
                <input
                  id="reg-confirm"
                  type={showPassword ? "text" : "password"}
                  name="confirmpassword"
                  value={form.confirmpassword}
                  onChange={handleChange}
                  placeholder="Re-enter your password"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:border-[#0d2a46] outline-none transition"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#0d2a46] text-white py-2.5 rounded-lg text-sm font-bold hover:bg-[#163d61] transition disabled:opacity-60"
              >
                {submitting ? "Sending verification code..." : "Send Verification Code"}
              </button>

              <p className="text-center text-xs text-slate-600 pt-2 border-t border-slate-100">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-semibold text-[#0d2a46] hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Register;
