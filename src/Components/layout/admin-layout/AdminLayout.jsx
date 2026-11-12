import React, { useState } from "react";
import AdminSidebar from "../../AdminSidebar";

const AdminLayout = ({ children }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#f1f3f6]">

      {/* Sidebar */}
      <AdminSidebar open={open} setOpen={setOpen} />

      {/* Content */}
      <div className="flex-1 min-w-0 overflow-x-hidden">

        {/* Mobile Navbar */}
        <div className="sticky top-0 z-30 md:hidden px-4 py-3 bg-white border-b border-slate-200 flex items-center">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open admin navigation"
            className="p-1.5 -ml-1.5 rounded-md text-xl text-slate-700 hover:bg-slate-100"
          >
            ☰
          </button>
          <h2 className="ml-3 font-semibold text-slate-900">Admin Panel</h2>
        </div>

        {children}
      </div>

    </div>
  );
};

export default AdminLayout;