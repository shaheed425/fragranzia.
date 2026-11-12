import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Usersidebar from "../../Components/Usersidebar";
import useUserService from "../../service/user-api-service/UserService";
import { AddressContext } from "../../Contexts/contexts";
import {
  PencilSquareIcon,
  TrashIcon,
  MapPinIcon,
  ShoppingBagIcon,
} from "@heroicons/react/24/outline";
import { getProductImageUrl, handleImageError } from "../../Axios";

const EMPTY_FORM = {
  fullName: "",
  phone: "",
  street: "",
  city: "",
  state: "",
  zip: "",
  country: "",
};

const Profile = () => {
  const {
    fetchedAddress,
    getAddresses,
    addAddress,
    editAddress,
    deleteAddress,
    setDefaultAddress,
  } = useContext(AddressContext);

  const { fetchorders } = useUserService();
  const [orders, setOrders] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);

  useEffect(() => {
    getAddresses();
    let active = true;
    fetchorders()
      .then((res) => {
        if (active && res?.success) setOrders(res.data || []);
      })
      .catch((err) => {
        console.error("Failed to fetch orders:", err);
      });
    return () => {
      active = false;
    };
  }, [getAddresses, fetchorders]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await editAddress(editingId, formData);
      } else {
        await addAddress(formData);
      }
      setShowForm(false);
      setEditingId(null);
      setFormData(EMPTY_FORM);
    } catch {
      // toast handled in AddressContext
    }
  };

  const handleEdit = (addr) => {
    setFormData({
      fullName: addr.fullName || "",
      phone: addr.phone || "",
      street: addr.street || "",
      city: addr.city || "",
      state: addr.state || "",
      zip: addr.zip || "",
      country: addr.country || "",
    });
    setEditingId(addr._id);
    setShowForm(true);
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex flex-col bg-[#f1f3f6] text-slate-900">
      <div className="flex-1 max-w-7xl w-full mx-auto px-0 sm:px-6 py-0 sm:py-6 flex flex-col md:flex-row gap-4 sm:gap-6 items-start">
        <Usersidebar activeTab="profile" />

        <main className="flex-1 w-full px-3 sm:px-0 py-4 sm:py-0 space-y-5 min-w-0">
          <div className="bg-white rounded-lg border border-slate-200 px-4 sm:px-5 py-4">
            <h1 className="text-lg sm:text-xl font-bold text-slate-900">
              My Profile & Saved Addresses
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage delivery addresses and view recent orders.
            </p>
          </div>

          {/* ADDRESS SECTION */}
          <section className="bg-white rounded-lg border border-slate-200 p-4 sm:p-5 space-y-4">
            <div className="flex flex-wrap justify-between items-center gap-3">
              <div className="flex items-center gap-2">
                <MapPinIcon className="w-5 h-5 text-[#0d2a46]" />
                <h2 className="text-base font-bold text-slate-900">
                  Saved Addresses ({fetchedAddress.length})
                </h2>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowForm(!showForm);
                  setEditingId(null);
                  setFormData(EMPTY_FORM);
                }}
                className="px-4 py-2 bg-[#0d2a46] text-white rounded-md hover:bg-[#163d61] transition text-xs font-semibold"
              >
                {showForm ? "Cancel" : "+ Add New Address"}
              </button>
            </div>

            {showForm && (
              <form
                onSubmit={handleSubmit}
                className="p-4 rounded-lg bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3"
              >
                <div>
                  <label htmlFor="prof-fullName" className="block text-xs font-semibold text-slate-600 mb-1">
                    Full Name
                  </label>
                  <input
                    id="prof-fullName"
                    name="fullName"
                    value={formData.fullName}
                    placeholder="Full Name"
                    onChange={handleChange}
                    className="w-full bg-white border border-slate-300 px-3 py-2 rounded-md text-sm outline-none focus:border-[#0d2a46]"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="prof-phone" className="block text-xs font-semibold text-slate-600 mb-1">
                    Phone
                  </label>
                  <input
                    id="prof-phone"
                    name="phone"
                    value={formData.phone}
                    placeholder="Phone"
                    onChange={handleChange}
                    className="w-full bg-white border border-slate-300 px-3 py-2 rounded-md text-sm outline-none focus:border-[#0d2a46]"
                    required
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="prof-street" className="block text-xs font-semibold text-slate-600 mb-1">
                    Street Address
                  </label>
                  <input
                    id="prof-street"
                    name="street"
                    value={formData.street}
                    placeholder="House No, Building, Street"
                    onChange={handleChange}
                    className="w-full bg-white border border-slate-300 px-3 py-2 rounded-md text-sm outline-none focus:border-[#0d2a46]"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="prof-city" className="block text-xs font-semibold text-slate-600 mb-1">
                    City
                  </label>
                  <input
                    id="prof-city"
                    name="city"
                    value={formData.city}
                    placeholder="City"
                    onChange={handleChange}
                    className="w-full bg-white border border-slate-300 px-3 py-2 rounded-md text-sm outline-none focus:border-[#0d2a46]"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="prof-state" className="block text-xs font-semibold text-slate-600 mb-1">
                    State
                  </label>
                  <input
                    id="prof-state"
                    name="state"
                    value={formData.state}
                    placeholder="State"
                    onChange={handleChange}
                    className="w-full bg-white border border-slate-300 px-3 py-2 rounded-md text-sm outline-none focus:border-[#0d2a46]"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="prof-zip" className="block text-xs font-semibold text-slate-600 mb-1">
                    Pincode
                  </label>
                  <input
                    id="prof-zip"
                    name="zip"
                    value={formData.zip}
                    placeholder="Pincode"
                    onChange={handleChange}
                    className="w-full bg-white border border-slate-300 px-3 py-2 rounded-md text-sm outline-none focus:border-[#0d2a46]"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="prof-country" className="block text-xs font-semibold text-slate-600 mb-1">
                    Country
                  </label>
                  <input
                    id="prof-country"
                    name="country"
                    value={formData.country}
                    placeholder="Country"
                    onChange={handleChange}
                    className="w-full bg-white border border-slate-300 px-3 py-2 rounded-md text-sm outline-none focus:border-[#0d2a46]"
                    required
                  />
                </div>
                <div className="sm:col-span-2 pt-1">
                  <button
                    type="submit"
                    className="bg-[#0d2a46] text-white px-5 py-2.5 rounded-md text-xs font-bold hover:bg-[#163d61] transition"
                  >
                    {editingId ? "Update Address" : "Save Address"}
                  </button>
                </div>
              </form>
            )}

            {fetchedAddress.length === 0 ? (
              <p className="text-sm text-slate-500 py-4 text-center border border-dashed border-slate-200 rounded-lg">
                No addresses saved yet. Add one for faster checkout.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {fetchedAddress.map((addr) => (
                  <div
                    key={addr._id}
                    className={`p-4 rounded-lg border flex justify-between gap-3 ${
                      addr.isDefault
                        ? "border-[#0d2a46] bg-sky-50/30"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    <div className="min-w-0">
                      <label className="inline-flex items-center gap-2 mb-2 cursor-pointer">
                        <input
                          type="radio"
                          name="primaryAddress"
                          checked={addr.isDefault}
                          onChange={() => setDefaultAddress(addr._id)}
                          className="accent-[#0d2a46] w-4 h-4 cursor-pointer"
                        />
                        <span className="text-xs font-semibold text-[#0d2a46]">
                          {addr.isDefault ? "Default Address" : "Set as Default"}
                        </span>
                      </label>

                      <p className="text-sm font-bold text-slate-900">{addr.fullName}</p>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {addr.street}, {addr.city}, {addr.state} - {addr.zip}, {addr.country}
                      </p>
                      <p className="text-xs font-semibold text-slate-700 mt-1.5">
                        {addr.phone}
                      </p>
                    </div>

                    <div className="flex flex-col gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleEdit(addr)}
                        aria-label={`Edit address for ${addr.fullName}`}
                        className="p-2 text-[#0d2a46] hover:bg-slate-100 rounded-md transition"
                      >
                        <PencilSquareIcon className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteAddress(addr._id)}
                        aria-label={`Delete address for ${addr.fullName}`}
                        className="p-2 text-rose-600 hover:bg-rose-50 rounded-md transition"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* RECENT ORDERS */}
          <section className="bg-white rounded-lg border border-slate-200 p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <ShoppingBagIcon className="w-5 h-5 text-[#0d2a46]" />
                <h2 className="text-base font-bold text-slate-900">
                  Recent Orders ({orders.length})
                </h2>
              </div>
              <Link
                to="/orderdetails"
                className="text-xs font-semibold text-[#0d2a46] hover:underline"
              >
                Manage All →
              </Link>
            </div>

            {orders.length > 0 ? (
              <div className="space-y-3">
                {orders.slice(0, 5).map((order) => (
                  <div
                    key={order._id}
                    className="rounded-lg border border-slate-200 overflow-hidden"
                  >
                    <div className="bg-slate-50 px-4 py-2.5 flex justify-between items-center text-xs gap-2 flex-wrap border-b border-slate-200">
                      <div>
                        <span className="text-slate-500">Order </span>
                        <span className="font-mono font-bold text-slate-900">
                          #{order._id.slice(-8).toUpperCase()}
                        </span>
                      </div>

                      <span
                        className={`px-2.5 py-0.5 rounded-full font-semibold ${
                          order.deliveryStatus === "Delivered"
                            ? "bg-emerald-50 text-emerald-700"
                            : order.deliveryStatus === "Cancelled"
                            ? "bg-rose-50 text-rose-700"
                            : "bg-sky-50 text-[#0d2a46]"
                        }`}
                      >
                        {order.deliveryStatus}
                      </span>
                    </div>

                    <div className="p-3.5 space-y-2">
                      {order.orderItems?.map((item, idx) => (
                        <div key={idx} className="flex gap-3 items-center">
                          <img
                            src={getProductImageUrl(item.product?.images)}
                            onError={handleImageError}
                            className="w-11 h-11 rounded border border-slate-200 object-contain bg-slate-50 p-1 shrink-0"
                            alt={item.product?.name || "Product"}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate">
                              {item.product?.name || "Product unavailable"}
                            </p>
                            <p className="text-xs text-slate-500">Qty: {item.quantity}</p>
                          </div>
                        </div>
                      ))}

                      <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs">
                        <span className="text-slate-500">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                        <span className="text-sm font-bold text-slate-900">
                          Total: ₹{order.totalAmount ?? 0}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center space-y-2">
                <p className="text-sm text-slate-500">
                  You have not placed any orders yet.
                </p>
                <Link
                  to="/product"
                  className="inline-block text-xs font-semibold text-[#0d2a46] hover:underline"
                >
                  Start Shopping →
                </Link>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
};

export default Profile;
