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
  Copy,
} from "lucide-react";
import toast from "react-hot-toast";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { getUsersData, adminResetUserPasswordAPI } = useAdminService();

  // Password visibility state map: { [userId]: boolean }
  const [revealedPasswords, setRevealedPasswords] = useState({});

  // Password reset modal state
  const [selectedUser, setSelectedUser] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [showModalPassword, setShowModalPassword] = useState(false);
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

  const togglePasswordVisibility = (userId) => {
    setRevealedPasswords((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  };

  const copyPassword = (password, userName) => {
    if (!password) return;
    navigator.clipboard.writeText(password);
    toast.success(`Copied password for ${userName}!`);
  };

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

      // Update state locally so the new password is shown immediately
      setUsers((prev) =>
        prev.map((u) =>
          u._id === selectedUser._id
            ? { ...u, visiblePassword: newPassword }
            : u
        )
      );

      // Automatically reveal the newly assigned password
      setRevealedPasswords((prev) => ({
        ...prev,
        [selectedUser._id]: true,
      }));

      setSelectedUser(null);
      setNewPassword("");
      setShowModalPassword(false);
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
            Registered accounts, live password visibility, and credentials management
          </p>
        </div>
        <div className="inline-flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-xs font-semibold text-slate-700">
          <UsersIcon size={15} className="text-[#0d2a46]" />
          {users.length} Total Members
        </div>
      </header>

      {/* Security Banner */}
      <div className="bg-sky-50 border border-sky-200 rounded-xl p-3.5 flex items-start gap-3 text-xs text-sky-950">
        <Info className="w-5 h-5 text-sky-700 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-bold text-sky-900">
            Admin Credential Access & Password Viewer
          </p>
          <p className="text-sky-800 leading-relaxed">
            Click the <Eye size={12} className="inline mx-1 text-slate-700" /> <strong>Eye icon</strong> next to any user below to reveal their password or <Copy size={12} className="inline mx-1 text-slate-700" /> to copy it. For any customer needing assistance, use <strong>Reset Password</strong> to assign and view their new password.
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
                <th className="px-4 py-3">Password</th>
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
                  const isRevealed = Boolean(revealedPasswords[user._id]);
                  const hasPassword = Boolean(user.visiblePassword);

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

                      {/* Password Show / Hide Column */}
                      <td className="px-4 py-3.5">
                        {hasPassword ? (
                          <div className="inline-flex items-center gap-2 bg-slate-50 border border-slate-200/90 rounded-lg px-2.5 py-1 text-xs">
                            <Lock size={12} className="text-emerald-600 shrink-0" />
                            <span className="font-mono font-bold text-slate-800 tracking-wider select-all">
                              {isRevealed ? user.visiblePassword : "••••••••"}
                            </span>
                            <button
                              type="button"
                              onClick={() => togglePasswordVisibility(user._id)}
                              className="text-slate-500 hover:text-slate-900 p-0.5 rounded transition cursor-pointer"
                              title={isRevealed ? "Hide password" : "Show password"}
                            >
                              {isRevealed ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                            <button
                              type="button"
                              onClick={() => copyPassword(user.visiblePassword, user.name)}
                              className="text-slate-400 hover:text-[#0d2a46] p-0.5 rounded transition cursor-pointer"
                              title="Copy password"
                            >
                              <Copy size={13} />
                            </button>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 bg-amber-50/80 border border-amber-200 rounded-lg px-2.5 py-1 text-xs text-amber-800">
                            <Lock size={12} className="text-amber-600 shrink-0" />
                            <span className="font-mono text-slate-600">••••••••</span>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedUser(user);
                                setNewPassword("");
                                setShowModalPassword(true);
                              }}
                              className="text-[11px] font-semibold text-amber-900 underline hover:text-amber-950 ml-1 cursor-pointer"
                              title="Set password to make it visible"
                            >
                              Reset to view
                            </button>
                          </div>
                        )}
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
                            setShowModalPassword(true);
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
                    Set User Password
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
                    type={showModalPassword ? "text" : "password"}
                    required
                    minLength={6}
                    placeholder="Enter at least 6 characters..."
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-[#0d2a46] pr-10 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowModalPassword(!showModalPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showModalPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">
                  This password will be immediately visible to you in the table and usable by the customer.
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
                  {resetting ? "Saving..." : "Save Password"}
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
