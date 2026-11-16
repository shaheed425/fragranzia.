import { useCallback, useEffect, useState } from "react";
import useAdminService from "../../service/admin-api-service/adminservice";
import {
  Users as UsersIcon,
  Mail,
  Shield,
  Calendar,
  Search,
  Key,
  Lock,
  Eye,
  EyeOff,
  Check,
  X,
  Info,
} from "lucide-react";
import toast from "react-hot-toast";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { getUsersData, adminResetUserPasswordAPI } = useAdminService();

  // Password reset modal state
  const [selectedUser, setSelectedUser] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [resetting, setResetting] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await getUsersData();
      setUsers(res.data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  }, [getUsersData]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    if (!selectedUser || !newPassword || newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    try {
      setResetting(true);
      const res = await adminResetUserPasswordAPI(selectedUser._id, newPassword);
      toast.success(res?.message || `Password updated for ${selectedUser.name}!`);
      setSelectedUser(null);
      setNewPassword("");
      setShowPassword(false);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update password");
    } finally {
      setResetting(false);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f1f3f6] p-4 sm:p-6 space-y-4 text-slate-900">
      {/* Header */}
      <header className="bg-white rounded-xl border border-slate-200 px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Customers & Users ({users.length})
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Registered accounts, security status, and role management across Fragranzia
          </p>
        </div>
        <div className="inline-flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-xs font-semibold text-slate-700">
          <UsersIcon size={15} className="text-[#0d2a46]" />
          {users.length} Total Members
        </div>
      </header>

      {/* Security Note Banner */}
      <div className="bg-sky-50 border border-sky-200 rounded-xl p-3.5 flex items-start gap-3 text-xs text-sky-950">
        <Info className="w-5 h-5 text-sky-700 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-bold text-sky-900">
            Bank-Grade Password Security (Bcrypt One-Way Encryption)
          </p>
          <p className="text-sky-800 leading-relaxed">
            Per global privacy laws and Razorpay PCI-DSS security standards, customer passwords are cryptographically hashed using <strong>Bcrypt</strong> and cannot be decrypted by anyone. If a customer forgets their credentials, use the <strong>Reset Password</strong> action below to assign a new temporary password.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          size={16}
        />
        <input
          type="text"
          aria-label="Search users by name or email"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-[#0d2a46]"
        />
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
              <tr>
                <th className="px-4 py-3">Member</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Password / Security</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="px-4 py-4">
                      <div className="h-8 bg-slate-100 rounded w-full" />
                    </td>
                  </tr>
                ))
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((user) => {
                  const isUserAdmin = user.role === "admin";
                  return (
                    <tr key={user._id} className="hover:bg-slate-50 transition">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#0d2a46] text-white flex items-center justify-center text-xs font-bold shrink-0">
                            {user.name?.charAt(0)?.toUpperCase() || "U"}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-900">
                              {user.name}
                            </p>
                            <p className="text-[11px] font-mono text-slate-500">
                              #{user._id.slice(-6).toUpperCase()}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center gap-1.5 text-xs text-slate-700">
                          <Mail size={13} className="text-slate-400" />
                          {user.email}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            isUserAdmin
                              ? "bg-indigo-50 text-indigo-700"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          <Shield size={12} />
                          {isUserAdmin ? "Admin" : "Customer"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded px-2.5 py-1 text-xs text-slate-600">
                          <Lock size={12} className="text-emerald-600" />
                          <span className="tracking-widest font-mono text-slate-800">••••••••</span>
                          <span className="text-[10px] text-slate-400 ml-1 font-sans">
                            (Bcrypt Hashed)
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-slate-600 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5">
                          <Calendar size={13} className="text-slate-400" />
                          {new Date(user.createdAt || Date.now()).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedUser(user);
                            setNewPassword("");
                            setShowPassword(false);
                          }}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0d2a46] hover:text-[#163d61] bg-sky-50 hover:bg-sky-100 px-3 py-1.5 rounded-lg border border-sky-200 transition cursor-pointer"
                          title={`Reset password for ${user.name}`}
                        >
                          <Key size={13} />
                          Reset Password
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-sm text-slate-500">
                    No members found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Password Reset Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-sky-100 text-[#0d2a46] flex items-center justify-center shrink-0">
                  <Key size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Set New Password
                  </h3>
                  <p className="text-xs text-slate-500">
                    For <strong className="text-slate-700">{selectedUser.name}</strong> ({selectedUser.email})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    placeholder="Enter at least 6 characters..."
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-[#0d2a46] pr-10 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">
                  Once saved, the user can log in immediately with this new password.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  disabled={resetting}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resetting || newPassword.length < 6}
                  className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-[#0d2a46] hover:bg-[#163d61] rounded-lg transition disabled:opacity-50 shadow-xs cursor-pointer"
                >
                  <Check size={14} />
                  {resetting ? "Saving..." : "Save New Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
