import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import useUserService from "../../service/user-api-service/UserService";
import useAuth from "../../Hooks/useAuth";

export default function Login() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { setAuth } = useAuth();
  const { loginAPI } = useUserService();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectFrom = location.state?.from;
  const redirectTarget = redirectFrom
    ? `${redirectFrom.pathname}${redirectFrom.search || ""}`
    : "/";

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const onhandlesubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    try {
      setSubmitting(true);
      const res = await loginAPI({
        email: form.email.trim(),
        password: form.password,
      });
      if (res?.success && res?.token && res?.data) {
        const token = res.token;
        const role = res.data.role;
        const name = res.data.name;
        const email = res.data.email;

        localStorage.setItem("token", token);
        localStorage.setItem("role", role);
        localStorage.setItem("name", name);
        localStorage.setItem("email", email);
        toast.success("Login Successful!");

        setAuth({ token, role, name, email });

        if (role === "admin") {
          navigate("/addashboard", { replace: true });
        } else {
          navigate(redirectTarget, { replace: true });
        }
      } else {
        toast.error(res?.message || "Invalid server response during login");
      }
    } catch (error) {
      const errData = error.response?.data;
      const message = errData?.message || "Login failed";
      if (errData?.requiresVerification && errData?.email) {
        toast.error(message);
        navigate("/register", { state: { verifyEmail: errData.email } });
        return;
      }
      toast.error(message);
    } finally {
      setSubmitting(false);
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
            <h1 className="text-xl font-bold mt-1">Sign in to your account</h1>
            <p className="text-xs text-slate-200 mt-0.5">
              Access your orders, wishlist, and saved addresses
            </p>
          </div>

          <form onSubmit={onhandlesubmit} className="p-6 space-y-4">
            <div>
              <label
                htmlFor="login-email"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                Email Address
              </label>
              <input
                id="login-email"
                onChange={handleChange}
                name="email"
                type="email"
                value={form.email}
                placeholder="you@example.com"
                required
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:border-[#0d2a46] outline-none transition"
              />
            </div>

            <div>
              <label
                htmlFor="login-password"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  onChange={handleChange}
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  placeholder="Enter your password"
                  required
                  className="w-full px-3.5 py-2.5 pr-10 border border-slate-300 rounded-lg text-sm focus:border-[#0d2a46] outline-none transition"
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

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#0d2a46] text-white py-2.5 rounded-lg text-sm font-bold hover:bg-[#163d61] transition disabled:opacity-60"
            >
              {submitting ? "Signing in..." : "Login"}
            </button>

            <p className="text-center text-xs text-slate-600 pt-2 border-t border-slate-100">
              New to Fragranzia?{" "}
              <Link
                to="/register"
                className="font-semibold text-[#0d2a46] hover:underline"
              >
                Create an account
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
