import { Link, useLocation, useNavigate } from "react-router-dom";
import useAuth from "../Hooks/useAuth";
import { 
  LayoutDashboard, 
  Package, 
  Users as UsersIcon, 
  Tag, 
  ClipboardList, 
  CreditCard,
  LogOut,
  ExternalLink,
  ChevronLeft
} from "lucide-react";

const AdminSidebar = ({ open, setOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { setAuth } = useAuth();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("name");
    localStorage.removeItem("email");
    setAuth({});
    setOpen(false);
    navigate("/admin/login");
  };

  const menuItems = [
    { name: "Dashboard", path: "/addashboard", icon: <LayoutDashboard size={20} /> },
    { name: "Products", path: "/adproduct", icon: <Package size={20} /> },
    { name: "Users", path: "/allusers", icon: <UsersIcon size={20} /> },
    { name: "Categories", path: "/category", icon: <Tag size={20} /> },
    { name: "Orders", path: "/orders", icon: <ClipboardList size={20} /> },
    { name: "Payments", path: "/adpayments", icon: <CreditCard size={20} /> },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Overlay for mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-[#0d2a46]/40 backdrop-blur-sm md:hidden z-40 transition-opacity duration-300"
          onClick={() => setOpen(false)}
        ></div>
      )}

      <aside
        className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-[#0d2a46] text-white transform z-50 flex flex-col shadow-2xl transition-all duration-500 ease-in-out
        ${open ? "translate-x-0" : "-translate-x-full"} 
        md:translate-x-0`}
      >
        {/* Header */}
        <div className="p-8 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-2xl font-serif font-bold tracking-tight">Fragranzia</span>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mt-1">Admin Portal</span>
          </div>
          <button onClick={() => setOpen(false)} className="md:hidden p-2 hover:bg-white/10 rounded-xl transition-colors">
            <ChevronLeft size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => (
            <Link key={item.path} to={item.path} onClick={() => setOpen(false)}>
              <div className={`flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 group ${
                isActive(item.path) 
                ? 'bg-white text-[#0d2a46] shadow-xl shadow-black/20' 
                : 'hover:bg-white/10 text-slate-400 hover:text-white'
              }`}>
                <span className={`${isActive(item.path) ? 'scale-110' : 'group-hover:scale-110'} transition-transform duration-300`}>
                  {item.icon}
                </span>
                <span className="font-bold text-sm tracking-wide">{item.name}</span>
                {isActive(item.path) && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#0d2a46]"></div>
                )}
              </div>
            </Link>
          ))}
        </nav>

        {/* Footer Actions */}
        <div className="p-6 border-t border-white/5 space-y-2">
          <Link to="/" className="flex items-center gap-4 px-6 py-3 rounded-2xl text-slate-400 hover:text-white hover:bg-white/5 transition-all">
            <ExternalLink size={18} />
            <span className="font-bold text-sm">Storefront</span>
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-6 py-3 rounded-2xl text-rose-300 hover:text-white hover:bg-rose-500/20 transition-all cursor-pointer"
          >
            <LogOut size={18} />
            <span className="font-bold text-sm">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;