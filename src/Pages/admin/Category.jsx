import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Categorycontext } from "../../Contexts/contexts";
import useAdminService from "../../service/admin-api-service/adminservice";
import { Tag, Plus, Search, Edit3, Ban, Check, Trash2 } from "lucide-react";

const Category = () => {
  const { category, loading, fetchCategory } = useContext(Categorycontext);
  const { deleteCategoryData, putCategoryData } = useAdminService();
  const [searchTerm, setSearchTerm] = useState("");

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        await deleteCategoryData(id);
        toast.success("Category deleted");
        fetchCategory();
      } catch (err) {
        console.error(err);
        toast.error(err.response?.data?.message || "Failed to delete category");
      }
    }
  };

  const handleToggleBlock = async (id, currentStatus) => {
    try {
      await putCategoryData(id, { isActive: !currentStatus });
      fetchCategory();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update status");
    }
  };

  const filteredCategories = category.filter(
    (c) =>
      c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f1f3f6] p-4 sm:p-6 space-y-4 text-slate-900">
      {/* Header */}
      <header className="bg-white rounded-xl border border-slate-200 px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Categories ({category.length})
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Organize fragrances by scent family and visibility
          </p>
        </div>

        <Link
          to="/addcategory"
          className="inline-flex items-center justify-center gap-1.5 bg-[#0d2a46] text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-[#163d61] transition w-fit"
        >
          <Plus size={15} /> Add Category
        </Link>
      </header>

      {/* Search */}
      <div className="relative">
        <Search
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          size={16}
        />
        <input
          type="text"
          aria-label="Search categories"
          placeholder="Search by category name or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white border border-slate-200 text-sm outline-none focus:border-[#0d2a46]"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-sm text-slate-500">
            Loading categories...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCategories.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-12 text-center text-sm text-slate-500">
                      <Tag size={24} className="mx-auto text-slate-300 mb-2" />
                      No matching categories found.
                    </td>
                  </tr>
                ) : (
                  filteredCategories.map((c) => {
                    const isActive = c.isActive !== false;
                    return (
                      <tr key={c._id} className="hover:bg-slate-50 transition">
                        <td className="px-4 py-3.5 font-semibold text-slate-900 whitespace-nowrap">
                          {c.name}
                        </td>
                        <td className="px-4 py-3.5 text-xs text-slate-600 max-w-md">
                          <p className="line-clamp-1">
                            {c.description || "Fragrance category"}
                          </p>
                        </td>
                        <td className="px-4 py-3.5">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              isActive
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-rose-50 text-rose-700"
                            }`}
                          >
                            {isActive ? <Check size={12} /> : <Ban size={12} />}
                            {isActive ? "Active" : "Hidden"}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              to={`/addcategory/${c._id}`}
                              aria-label={`Edit category ${c.name}`}
                              className="p-2 bg-slate-100 text-[#0d2a46] rounded-md hover:bg-[#0d2a46] hover:text-white transition"
                            >
                              <Edit3 size={14} />
                            </Link>
                            <button
                              type="button"
                              onClick={() => handleToggleBlock(c._id, c.isActive)}
                              aria-label={
                                isActive
                                  ? `Hide category ${c.name}`
                                  : `Show category ${c.name}`
                              }
                              className={`p-2 rounded-md transition ${
                                isActive
                                  ? "bg-amber-50 text-amber-700 hover:bg-amber-600 hover:text-white"
                                  : "bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white"
                              }`}
                            >
                              {isActive ? <Ban size={14} /> : <Check size={14} />}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(c._id)}
                              aria-label={`Delete category ${c.name}`}
                              className="p-2 bg-rose-50 text-rose-700 rounded-md hover:bg-rose-600 hover:text-white transition"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Category;
