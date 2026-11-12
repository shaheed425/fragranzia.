import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { Heart, Menu, Package, ShoppingCart, User, X } from "lucide-react";
import { AuthContext } from "../Contexts/contexts";

const Usersidebar = ({ activeTab }) => {
  const [open, setOpen] = useState(false);
  const { auth } = useContext(AuthContext);

  const initials = auth?.name
    ? auth.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";

  const navLinks = [
    { to: "/profile", key: "profile", label: "My Profile & Addresses", icon: User },
    { to: "/orderdetails", key: "orders", label: "My Orders", icon: Package },
    { to: "/wishlist", key: "wishlist", label: "My Wishlist", icon: Heart },
    { to: "/cart", key: "cart", label: "My Cart", icon: ShoppingCart },
  ];

  return (
    <>
      {/* MOBILE ACCOUNT BAR */}
      <div className="md:hidden w-full bg-white border-b border-slate-200 flex items-center justify-between px-4 py-2.5">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-800 p-1 rounded-md hover:bg-slate-100"
          aria-label="Open Account Menu"
        >
          <Menu size={18} />
          <span>Account Menu</span>
        </button>
        <span className="text-xs font-medium text-slate-500 truncate max-w-[160px]">
          {auth?.name || "Member"}
        </span>
      </div>

      {/* MOBILE OVERLAY */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* SIDEBAR */}
      <aside
        aria-label="Account navigation"
        className={`fixed inset-y-0 left-0 z-50 w-64 shrink-0 bg-white border-r border-slate-200 overflow-y-auto md:overflow-visible md:sticky md:top-20 md:self-start md:z-10 md:rounded-lg md:border md:h-fit transform transition-transform duration-200 ${
          open ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <div className="md:hidden flex justify-between items-center px-4 py-3 border-b border-slate-200">
          <span className="text-sm font-bold text-slate-900">My Account</span>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="p-1 rounded-md text-slate-600 hover:bg-slate-100"
            aria-label="Close Account Menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* USER INFO */}
        <div className="p-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#0d2a46] text-white flex items-center justify-center text-sm font-bold shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-900 truncate">
                {auth?.name || "Member"}
              </p>
              <p className="text-xs text-slate-500 truncate">
                {auth?.email || ""}
              </p>
            </div>
          </div>
        </div>

        {/* MENU LINKS */}
        <nav className="p-2.5 space-y-1">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.key;
            return (
              <Link
                key={item.key}
                to={item.to}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition ${
                  isActive
                    ? "bg-[#0d2a46] text-white font-semibold"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
};

export default Usersidebar;
