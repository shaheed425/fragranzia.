import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import useAdminService from "../../service/admin-api-service/adminservice";
import { Categorycontext } from "../../Contexts/contexts";
import { ArrowLeft, Check, X } from "lucide-react";

const Addcategory = () => {
  const { postCategoryData, getCategoryData, putCategoryData } = useAdminService();
  const { fetchCategory } = useContext(Categorycontext);
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [category, setCategory] = useState({
    name: "",
    description: "",
  });

  useEffect(() => {
    if (!isEditing) return;
    let active = true;
    getCategoryData()
      .then((res) => {
        if (!active) return;
        const currentCategory = res.data?.find((c) => c._id === id);
        if (currentCategory) {
          setCategory({
            name: currentCategory.name || "",
            description: currentCategory.description || "",
          });
        }
      })
      .catch((err) => {
        console.error(err);
      });
    return () => {
      active = false;
    };
  }, [isEditing, getCategoryData, id]);

  const handlechange = (e) => {
    const { name, value } = e.target;
    setCategory({ ...category, [name]: value });
  };

  const onhandlesubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await putCategoryData(id, category);
        toast.success("Category updated successfully");
      } else {
        await postCategoryData(category);
        toast.success("Category created successfully");
      }
      await fetchCategory();
      navigate("/category");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Action failed");
    }
  };

  return (
    <div className="min-h-screen bg-[#f1f3f6] p-4 sm:p-6 text-slate-900">
      <div className="max-w-2xl mx-auto space-y-4">
        <header className="bg-white rounded-xl border border-slate-200 px-5 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/category")}
              aria-label="Back to categories"
              className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-[#0d2a46] transition"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900">
                {isEditing ? "Edit Category" : "New Category"}
              </h1>
              <p className="text-xs text-slate-500">
                Organize products into clear fragrance groups
              </p>
            </div>
          </div>
        </header>

        <form
          onSubmit={onhandlesubmit}
          className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 space-y-5"
        >
          <div>
            <label
              htmlFor="cat-name"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              Category Name
            </label>
            <input
              id="cat-name"
              onChange={handlechange}
              type="text"
              name="name"
              value={category.name}
              placeholder="e.g., Summer Florals"
              className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-[#0d2a46]"
              required
            />
          </div>

          <div>
            <label
              htmlFor="cat-desc"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              Description
            </label>
            <textarea
              id="cat-desc"
              onChange={handlechange}
              name="description"
              value={category.description}
              rows={4}
              placeholder="Describe this fragrance family..."
              className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-[#0d2a46] resize-y"
              required
            />
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#0d2a46] text-white text-xs font-bold hover:bg-[#163d61] transition"
            >
              <Check size={15} /> {isEditing ? "Save Changes" : "Create Category"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/category")}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-white text-slate-700 text-xs font-semibold border border-slate-300 hover:bg-slate-50 transition"
            >
              <X size={15} /> Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Addcategory;
