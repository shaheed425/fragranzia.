import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import useAdminService from "../../service/admin-api-service/adminservice";
import {
  IndianRupee,
  Package,
  ShoppingBag,
  Clock,
  Search,
  RefreshCw,
} from "lucide-react";
import { getProductImageUrl, handleImageError } from "../../Axios";

const Orders = () => {
  const { getallorders, updateOrderStatusAPI, verifyOrderPaymentAdminAPI } = useAdminService();
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [verifyingId, setVerifyingId] = useState(null);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getallorders();
      setOrders(res.orders || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [getallorders]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const filteredOrders = orders.filter(
    (order) =>
      order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order._id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStatusUpdate = async (id, status) => {
    try {
      await updateOrderStatusAPI(id, status);
      await fetchOrders();
      toast.success("Order status updated!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status");
    }
  };

  const handleManualVerify = async (orderId) => {
    try {
      setVerifyingId(orderId);
      const res = await verifyOrderPaymentAdminAPI(orderId);
      await fetchOrders();
      toast.success(`Payment verified: ${res?.paymentState || res?.paymentStatus}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Manual verification failed");
    } finally {
      setVerifyingId(null);
    }
  };

  const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
  const pendingOrders = orders.filter((o) => o.deliveryStatus === "Pending").length;
  const completedOrders = orders.filter((o) => o.deliveryStatus === "Delivered").length;

  return (
    <div className="min-h-screen bg-[#f1f3f6] p-4 sm:p-6 space-y-4 text-slate-900">
      {/* Header */}
      <header className="bg-white rounded-xl border border-slate-200 px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Orders</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Track, fulfill, and update customer order statuses
          </p>
        </div>
        <div className="inline-flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2">
          <IndianRupee size={16} className="text-[#0d2a46]" />
          <div>
            <p className="text-[11px] font-medium text-slate-500 leading-none">
              Total Revenue
            </p>
            <p className="text-sm font-bold text-slate-900 mt-0.5">
              ₹{totalRevenue.toLocaleString()}
            </p>
          </div>
        </div>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-3">
          <div className="p-2.5 bg-amber-50 text-amber-700 rounded-lg">
            <Clock size={18} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Pending</p>
            <p className="text-xl font-bold text-slate-900">{pendingOrders}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-3">
          <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-lg">
            <ShoppingBag size={18} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Delivered</p>
            <p className="text-xl font-bold text-slate-900">{completedOrders}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-3">
          <div className="p-2.5 bg-sky-50 text-[#0d2a46] rounded-lg">
            <Package size={18} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Total Orders</p>
            <p className="text-xl font-bold text-slate-900">{orders.length}</p>
          </div>
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
          aria-label="Search orders by ID, customer name, or email"
          placeholder="Search by Order ID, customer name, or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white border border-slate-200 text-sm outline-none focus:border-[#0d2a46]"
        />
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
              <tr>
                <th className="px-4 py-3">Order & Date</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Items</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Update</th>
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
              ) : filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <p className="font-mono text-xs font-bold text-[#0d2a46]">
                        #{order._id.slice(-8).toUpperCase()}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-sm font-semibold text-slate-900">
                        {order.user?.name || "Unknown"}
                      </p>
                      <p className="text-xs text-slate-500">
                        {order.user?.email || ""}
                      </p>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center -space-x-2">
                        {order.orderItems?.slice(0, 3).map((item, idx) => (
                          <div
                            key={idx}
                            className="h-8 w-8 rounded border border-slate-200 bg-white p-0.5 overflow-hidden"
                          >
                            <img
                              src={getProductImageUrl(item.product?.images)}
                              onError={handleImageError}
                              className="h-full w-full object-contain"
                              alt={item.product?.name || "Order item"}
                            />
                          </div>
                        ))}
                        {(order.orderItems?.length || 0) > 3 && (
                          <span className="h-8 w-8 rounded border border-slate-200 bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
                            +{order.orderItems.length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <p className="font-bold text-slate-900">
                        ₹{order.totalAmount ?? 0}
                      </p>
                      <div className="flex flex-col gap-0.5 mt-0.5">
                        <span
                          className={`text-[11px] font-semibold ${
                            order.paymentStatus === "Paid" ||
                            order.paymentState === "CAPTURED" ||
                            order.paymentState === "SUCCESS"
                              ? "text-emerald-700"
                              : order.paymentState === "FAILED" || order.paymentStatus === "Failed"
                              ? "text-rose-700"
                              : order.paymentState === "REFUNDED" || order.paymentStatus === "Refunded"
                              ? "text-indigo-700"
                              : "text-amber-700"
                          }`}
                        >
                          {order.paymentMethod || "COD"} •{" "}
                          {order.paymentMethod === "UPI"
                            ? order.paymentState || order.paymentStatus
                            : order.paymentStatus}
                        </span>
                        {order.razorpay_payment_id && (
                          <span className="text-[10px] font-mono text-slate-400">
                            {order.razorpay_payment_id}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          order.deliveryStatus === "Delivered"
                            ? "bg-emerald-50 text-emerald-700"
                            : order.deliveryStatus === "Cancelled"
                            ? "bg-rose-50 text-rose-700"
                            : order.deliveryStatus === "Shipping"
                            ? "bg-indigo-50 text-indigo-700"
                            : order.deliveryStatus === "Returned"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {order.deliveryStatus}
                      </span>
                      {order.isReturned && order.returnReason && (
                        <p
                          className="text-[11px] text-slate-500 mt-0.5 truncate max-w-[140px]"
                          title={order.returnReason}
                        >
                          {order.returnReason}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="inline-flex items-center justify-end gap-2">
                        {order.paymentMethod === "UPI" && order.razorpay_order_id && (
                          <button
                            type="button"
                            onClick={() => handleManualVerify(order._id)}
                            disabled={verifyingId === order._id}
                            title="Verify live payment status with Razorpay API"
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-slate-300 bg-white text-xs font-semibold text-[#0d2a46] hover:bg-slate-50 transition disabled:opacity-50"
                          >
                            <RefreshCw
                              size={12}
                              className={verifyingId === order._id ? "animate-spin" : ""}
                            />
                            {verifyingId === order._id ? "Checking" : "Verify Payment"}
                          </button>
                        )}
                        <select
                          aria-label={`Update delivery status for order ${order._id.slice(-8).toUpperCase()}`}
                          value={order.deliveryStatus}
                          onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                          className="text-xs font-semibold border border-slate-300 rounded-md px-2.5 py-1.5 bg-white outline-none focus:border-[#0d2a46] cursor-pointer"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Confirmed">Confirmed</option>
                          <option value="Shipping">Shipping</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Returned">Returned</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-sm text-slate-500">
                    No matching orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Orders;
