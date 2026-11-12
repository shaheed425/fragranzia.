import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { ShieldCheck, Lock, Mail, Eye, EyeOff } from "lucide-react";
import useUserService from "../../service/user-api-service/UserService";
import useAuth from "../../Hooks/useAuth";

const AdminLogin = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { loginAPI } = useUserService();
  const { setAuth } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    try {
      setSubmitting(true);
      const res = await loginAPI({
        email: form.email.trim(),
        password: form.password,
      });
      if (res?.success && res?.token && res?.data) {
        const { role, name, email } = res.data;
        if (role !== "admin") {
          toast.error("Administrator privileges required");
          return;
        }
        const token = res.token;
        localStorage.setItem("token", token);
        localStorage.setItem("role", role);
        localStorage.setItem("name", name);
        localStorage.setItem("email", email);
        setAuth({ token, role, name, email });
        toast.success("Welcome to Admin Portal");
        navigate("/addashboard", { replace: true });
      } else {
        toast.error(res?.message || "Invalid server response during login");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Admin login failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f1f3f6] px-4 py-8 text-slate-900">
      <div className="bg-white w-full max-w-md rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="bg-[#0d2a46] px-6 py-5 text-white flex items-center gap-3">
          <div className="p-2.5 bg-white/15 rounded-lg shrink-0">
            <ShieldCheck size={22} />
          </div>
          <div>
            <h1 className="text-lg font-bold">Fragranzia Seller Admin</h1>
            <p className="text-xs text-slate-200">Authorized administrator sign-in</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label
              htmlFor="admin-email"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              Admin Email
            </label>
            <div className="relative">
              <Mail
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                id="admin-email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="admin@fragranzia.com"
                required
                className="w-full pl-10 pr-3.5 py-2.5 border border-slate-300 rounded-lg focus:border-[#0d2a46] outline-none transition text-sm"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="admin-password"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              Password
            </label>
            <div className="relative">
              <Lock
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                id="admin-password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={handleChange}
                placeholder="Enter password"
                required
                className="w-full pl-10 pr-10 py-2.5 border border-slate-300 rounded-lg focus:border-[#0d2a46] outline-none transition text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-[#0d2a46] text-white py-2.5 rounded-lg text-sm font-bold hover:bg-[#163d61] transition disabled:opacity-60"
          >
            {submitting ? "Signing in..." : "Sign in to Portal"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
