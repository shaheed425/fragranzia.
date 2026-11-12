import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Adminproductcontext } from "../../Contexts/contexts";
import useAdminService from "../../service/admin-api-service/adminservice";
import {
  Users as UsersIcon,
  Package,
  Tag,
  TrendingUp,
  ArrowUpRight,
  ClipboardList,
} from "lucide-react";

const Dasboard = () => {
  const { fetchusers, users } = useContext(Adminproductcontext);
  const { getProductData, getCategoryData } = useAdminService();
  const [productCount, setProductCount] = useState(0);
  const [categoryCount, setCategoryCount] = useState(0);

  useEffect(() => {
    fetchusers();
    let active = true;
    Promise.all([getProductData(), getCategoryData()])
      .then(([prodRes, catRes]) => {
        if (!active) return;
        setProductCount(prodRes.data?.length || 0);
        setCategoryCount(catRes.data?.length || 0);
      })
      .catch((err) => {
        console.error(err);
      });
    return () => {
      active = false;
    };
  }, [fetchusers, getProductData, getCategoryData]);

  const stats = [
    {
      label: "Total Users",
      value: users.length,
      icon: <UsersIcon size={18} />,
      color: "bg-indigo-50 text-indigo-700",
    },
    {
      label: "Products",
      value: productCount,
      icon: <Package size={18} />,
      color: "bg-sky-50 text-[#0d2a46]",
    },
    {
      label: "Categories",
      value: categoryCount,
      icon: <Tag size={18} />,
      color: "bg-emerald-50 text-emerald-700",
    },
    {
      label: "Store Status",
      value: "Live",
      icon: <TrendingUp size={18} />,
      color: "bg-amber-50 text-amber-700",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f1f3f6] p-4 sm:p-6 space-y-5 text-slate-900">
      {/* Compact Header */}
      <header className="bg-white rounded-xl border border-slate-200 px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Seller Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Overview of inventory, categories, and registered customers
          </p>
        </div>
        <Link
          to="/adproduct"
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-[#0d2a46] text-white rounded-lg hover:bg-[#163d61] transition text-xs font-bold w-fit"
        >
          Manage Inventory <ArrowUpRight size={15} />
        </Link>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3.5"
          >
            <div className={`p-2.5 rounded-lg shrink-0 ${stat.color}`}>
              {stat.icon}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-500 truncate">
                {stat.label}
              </p>
              <p className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">
                {stat.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 items-start">
        {/* Recent Members */}
        <section className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-200 flex justify-between items-center">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                Recent Members
              </h2>
              <p className="text-xs text-slate-500">Latest user registrations</p>
            </div>
            <Link
              to="/allusers"
              className="text-xs font-semibold text-[#0d2a46] hover:underline"
            >
              View All →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 text-xs font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3">Member</th>
                  <th className="px-5 py-3">Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.slice(0, 5).map((u) => {
                  const isUserAdmin = u.role === "admin";
                  return (
                    <tr key={u._id} className="hover:bg-slate-50 transition">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 text-[#0d2a46] flex items-center justify-center text-xs font-bold shrink-0">
                            {u.name?.charAt(0)?.toUpperCase() || "U"}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-900 truncate">
                              {u.name}
                            </p>
                            <p className="text-xs text-slate-500 truncate">
                              {u.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            isUserAdmin
                              ? "bg-indigo-50 text-indigo-700"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {isUserAdmin ? "Admin" : "Customer"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={2} className="px-5 py-6 text-center text-xs text-slate-500">
                      No users registered yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
          <h2 className="text-sm sm:text-base font-bold text-slate-900">
            Quick Actions
          </h2>
          <div className="space-y-2">
            {[
              { label: "Manage Inventory", path: "/adproduct", icon: <Package size={16} /> },
              { label: "Add New Product", path: "/productadding", icon: <ArrowUpRight size={16} /> },
              { label: "Review Orders", path: "/orders", icon: <ClipboardList size={16} /> },
              { label: "Categories", path: "/category", icon: <Tag size={16} /> },
              { label: "All Customers", path: "/allusers", icon: <UsersIcon size={16} /> },
            ].map((link) => (
              <Link
                key={link.label}
                to={link.path}
                className="flex items-center justify-between px-3.5 py-2.5 bg-slate-50 hover:bg-[#0d2a46] hover:text-white border border-slate-200 rounded-lg text-slate-800 font-semibold text-xs transition"
              >
                <span className="flex items-center gap-2.5">
                  {link.icon}
                  {link.label}
                </span>
                <ArrowUpRight size={14} />
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dasboard;
