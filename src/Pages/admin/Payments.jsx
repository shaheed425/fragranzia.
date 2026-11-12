import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  CreditCard,
  History,
  RefreshCw,
  RotateCcw,
  Search,
  ShieldAlert,
  Webhook,
  X,
  XCircle,
} from "lucide-react";
import useAdminService from "../../service/admin-api-service/adminservice";

const STATE_TABS = [
  { key: "ALL", label: "All Payments" },
  { key: "CAPTURED", label: "Captured" },
  { key: "PENDING", label: "Pending" },
  { key: "AUTHORIZED", label: "Authorized" },
  { key: "FAILED", label: "Failed" },
  { key: "REQUIRES_REVIEW", label: "Requires Review" },
  { key: "REFUNDED", label: "Refunded" },
];

const STATE_BADGE_MAP = {
  CAPTURED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  SUCCESS: "bg-emerald-50 text-emerald-700 border-emerald-200",
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  CREATED: "bg-slate-100 text-slate-700 border-slate-200",
  AUTHORIZED: "bg-blue-50 text-blue-700 border-blue-200",
  FAILED: "bg-rose-50 text-rose-700 border-rose-200",
  REQUIRES_REVIEW: "bg-orange-50 text-orange-800 border-orange-200",
  REFUND_PENDING: "bg-indigo-50 text-indigo-700 border-indigo-200",
  REFUNDED: "bg-indigo-50 text-indigo-700 border-indigo-200",
};

const formatDateTime = (value) => {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const Payments = () => {
  const {
    getPaymentOverviewAdminAPI,
    verifyOrderPaymentAdminAPI,
    getOrderTransactionsAdminAPI,
  } = useAdminService();

  const [activeState, setActiveState] = useState("ALL");
  const [activeSection, setActiveSection] = useState("orders");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [reconcilingId, setReconcilingId] = useState(null);

  const [overview, setOverview] = useState({
    summary: {
      totalGatewayOrders: 0,
      captured: 0,
      pending: 0,
      failed: 0,
      requiresReview: 0,
      refunded: 0,
    },
    systemHealth: {
      mongoConnected: true,
      workerStatus: "unknown",
      workerMode: null,
      lastWorkerHeartbeatAt: null,
      queuedWebhooks: 0,
      deadLetterWebhooks: 0,
    },
    orders: [],
    transactions: [],
    recentWebhooks: [],
    issueLogs: [],
  });

  const [historyModal, setHistoryModal] = useState({
    open: false,
    order: null,
    transactions: [],
    loading: false,
  });

  const fetchOverview = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getPaymentOverviewAdminAPI(activeState);
      setOverview({
        summary: data.summary || {
          totalGatewayOrders: 0,
          captured: 0,
          pending: 0,
          failed: 0,
          requiresReview: 0,
          refunded: 0,
        },
        systemHealth: data.systemHealth || {
          mongoConnected: true,
          workerStatus: "unknown",
          workerMode: null,
          lastWorkerHeartbeatAt: null,
          queuedWebhooks: 0,
          deadLetterWebhooks: 0,
        },
        orders: data.orders || [],
        transactions: data.transactions || [],
        recentWebhooks: data.recentWebhooks || [],
        issueLogs: data.issueLogs || [],
      });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load payment dashboard");
    } finally {
      setLoading(false);
    }
  }, [activeState, getPaymentOverviewAdminAPI]);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  const methodByOrderId = useMemo(() => {
    const map = {};
    for (const tx of overview.transactions) {
      const oid = tx.order?._id || tx.order;
      if (oid && !map[oid] && tx.method) {
        map[oid] = tx.method;
      }
    }
    return map;
  }, [overview.transactions]);

  const filteredOrders = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return overview.orders;
    return overview.orders.filter(
      (order) =>
        order._id?.toLowerCase().includes(query) ||
        order.orderNumber?.toLowerCase().includes(query) ||
        order.razorpay_order_id?.toLowerCase().includes(query) ||
        order.razorpay_payment_id?.toLowerCase().includes(query) ||
        order.user?.name?.toLowerCase().includes(query) ||
        order.user?.email?.toLowerCase().includes(query)
    );
  }, [overview.orders, searchTerm]);

  const filteredTransactions = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return overview.transactions.filter((tx) => {
      if (activeState !== "ALL" && tx.mappedStatus !== activeState) return false;
      if (!query) return true;
      return (
        tx.gatewayOrderId?.toLowerCase().includes(query) ||
        tx.gatewayPaymentId?.toLowerCase().includes(query) ||
        tx.order?.orderNumber?.toLowerCase().includes(query) ||
        tx.order?._id?.toLowerCase().includes(query) ||
        tx.user?.name?.toLowerCase().includes(query) ||
        tx.user?.email?.toLowerCase().includes(query)
      );
    });
  }, [overview.transactions, activeState, searchTerm]);

  const handleManualReconcile = async (orderId) => {
    try {
      setReconcilingId(orderId);
      const res = await verifyOrderPaymentAdminAPI(orderId);
      toast.success(
        `Reconciled: ${res?.paymentState || res?.paymentStatus || "Checked"}${
          res?.unknown ? " (gateway pending)" : ""
        }`
      );
      await fetchOverview();
      if (historyModal.open && historyModal.order?._id === orderId) {
        setHistoryModal((prev) => ({
          ...prev,
          order: res?.order || prev.order,
          transactions: res?.transactions || prev.transactions,
        }));
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Manual reconciliation failed");
    } finally {
      setReconcilingId(null);
    }
  };

  const openOrderHistory = async (order) => {
    setHistoryModal({ open: true, order, transactions: [], loading: true });
    try {
      const data = await getOrderTransactionsAdminAPI(order._id);
      setHistoryModal({
        open: true,
        order,
        transactions: data.transactions || [],
        loading: false,
      });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load attempt history");
      setHistoryModal((prev) => ({ ...prev, loading: false }));
    }
  };

  return (
    <div className="min-h-screen bg-[#f1f3f6] p-4 sm:p-6 space-y-4 text-slate-900">
      {/* Header */}
      <header className="bg-white rounded-xl border border-slate-200 px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <CreditCard size={22} className="text-[#0d2a46]" />
            Payments & Reconciliation
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor Razorpay transactions, webhook receipts, failures, and reconcile pending orders
          </p>
        </div>
        <button
          onClick={fetchOverview}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#0d2a46] hover:bg-[#163a5c] disabled:opacity-60 text-white text-xs font-semibold rounded-lg transition-colors self-start sm:self-auto"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh Data
        </button>
      </header>

      {/* Worker & Webhook Inbox Health Bar */}
      <div className="bg-white rounded-xl border border-slate-200 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex flex-wrap items-center gap-4">
          <span className="inline-flex items-center gap-1.5 font-medium text-slate-700">
            <span
              className={`h-2 w-2 rounded-full ${
                overview.systemHealth?.mongoConnected ? "bg-emerald-500" : "bg-rose-500"
              }`}
            />
            DB: {overview.systemHealth?.mongoConnected ? "Connected" : "Degraded"}
          </span>
          <span className="inline-flex items-center gap-1.5 font-medium text-slate-700">
            <span
              className={`h-2 w-2 rounded-full ${
                overview.systemHealth?.workerStatus === "healthy"
                  ? "bg-emerald-500"
                  : overview.systemHealth?.workerStatus === "stale"
                  ? "bg-amber-500"
                  : "bg-slate-400"
              }`}
            />
            Worker: {overview.systemHealth?.workerStatus || "unknown"}
            {overview.systemHealth?.workerMode ? ` (${overview.systemHealth.workerMode})` : ""}
          </span>
          {overview.systemHealth?.lastWorkerHeartbeatAt && (
            <span className="text-slate-500">
              Last heartbeat: {formatDateTime(overview.systemHealth.lastWorkerHeartbeatAt)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-slate-600">
            Queued Inbox: <strong>{overview.systemHealth?.queuedWebhooks ?? 0}</strong>
          </span>
          <span
            className={
              (overview.systemHealth?.deadLetterWebhooks ?? 0) > 0
                ? "text-rose-700 font-semibold"
                : "text-slate-600"
            }
          >
            Dead-Letter: <strong>{overview.systemHealth?.deadLetterWebhooks ?? 0}</strong>
          </span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-3">
          <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-lg">
            <CheckCircle2 size={18} />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-500">Captured</p>
            <p className="text-lg font-bold text-slate-900">{overview.summary.captured}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-3">
          <div className="p-2.5 bg-amber-50 text-amber-700 rounded-lg">
            <Clock size={18} />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-500">Pending / Auth</p>
            <p className="text-lg font-bold text-slate-900">{overview.summary.pending}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-3">
          <div className="p-2.5 bg-rose-50 text-rose-700 rounded-lg">
            <XCircle size={18} />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-500">Failed</p>
            <p className="text-lg font-bold text-slate-900">{overview.summary.failed}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-3">
          <div className="p-2.5 bg-orange-50 text-orange-700 rounded-lg">
            <ShieldAlert size={18} />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-500">Requires Review</p>
            <p className="text-lg font-bold text-slate-900">{overview.summary.requiresReview}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-3 col-span-2 sm:col-span-1">
          <div className="p-2.5 bg-indigo-50 text-indigo-700 rounded-lg">
            <RotateCcw size={18} />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-500">Refunded</p>
            <p className="text-lg font-bold text-slate-900">{overview.summary.refunded}</p>
          </div>
        </div>
      </div>

      {/* Filters & Section Switcher */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* View Tabs */}
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: "orders", label: `Gateway Orders (${filteredOrders.length})` },
              { id: "transactions", label: `All Attempts (${filteredTransactions.length})` },
              {
                id: "logs",
                label: `Issue Logs & Webhooks (${overview.issueLogs.length + overview.recentWebhooks.length})`,
              },
            ].map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                  activeSection === section.id
                    ? "bg-[#0d2a46] text-white border-[#0d2a46]"
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                }`}
              >
                {section.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full lg:w-80">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search order #, rzp_id, customer..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2874f0]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Status Filter Pills */}
        {activeSection !== "logs" && (
          <div className="flex flex-wrap gap-1.5 pt-1 border-t border-slate-100">
            {STATE_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveState(tab.key)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                  activeState === tab.key
                    ? "bg-[#2874f0] text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="bg-white rounded-xl border border-slate-200 p-14 flex flex-col items-center justify-center">
          <div className="h-8 w-8 border-2 border-[#2874f0] border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-sm text-slate-500">Loading payment records...</p>
        </div>
      ) : activeSection === "orders" ? (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
                  <th className="px-4 py-3">Internal Order</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Razorpay IDs</th>
                  <th className="px-4 py-3">Amount & Method</th>
                  <th className="px-4 py-3">State & Reconcile</th>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                      No payment orders match the current filter.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <p className="font-mono text-xs font-bold text-slate-900">
                          {order.orderNumber || `#${order._id.slice(-8).toUpperCase()}`}
                        </p>
                        <p className="font-mono text-[10px] text-slate-400">
                          {order._id}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-slate-800 text-xs">
                          {order.user?.name || "Customer"}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {order.user?.email || "—"}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-mono text-[11px] text-slate-700">
                          Pay: {order.razorpay_payment_id || "—"}
                        </p>
                        <p className="font-mono text-[10px] text-slate-400">
                          Ord: {order.razorpay_order_id || "—"}
                        </p>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <p className="font-bold text-slate-900">
                          ₹{Number(order.totalAmount || 0).toLocaleString("en-IN")}
                        </p>
                        <p className="text-[11px] text-slate-500 uppercase">
                          {methodByOrderId[order._id] || order.paymentMethod || "UPI"}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                            STATE_BADGE_MAP[order.paymentState] ||
                            "bg-slate-100 text-slate-700 border-slate-200"
                          }`}
                        >
                          {order.paymentState}
                        </span>
                        <div className="text-[10px] text-slate-500 mt-1 space-y-0.5">
                          <p>
                            Attempts: {order.paymentAttempts || 1} • Checks:{" "}
                            {order.reconcileAttempts || 0}
                          </p>
                          {order.webhookConfirmed && (
                            <p className="text-emerald-700 font-medium">Webhook synced</p>
                          )}
                          {(order.requiresReviewReason || order.paymentFailureReason) && (
                            <p className="text-rose-700 max-w-[220px] truncate" title={order.requiresReviewReason || order.paymentFailureReason}>
                              {order.requiresReviewReason || order.paymentFailureReason}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-600">
                        <p>{formatDateTime(order.createdAt)}</p>
                        {order.lastPaymentCheckAt && (
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            Checked: {formatDateTime(order.lastPaymentCheckAt)}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => handleManualReconcile(order._id)}
                            disabled={reconcilingId === order._id}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-blue-50 hover:bg-blue-100 text-[#2874f0] border border-blue-200 text-xs font-semibold disabled:opacity-50"
                          >
                            <RefreshCw
                              size={12}
                              className={reconcilingId === order._id ? "animate-spin" : ""}
                            />
                            Manual Reconcile
                          </button>
                          <button
                            onClick={() => openOrderHistory(order)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold"
                          >
                            <History size={12} />
                            History
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : activeSection === "transactions" ? (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Razorpay Payment / Order ID</th>
                  <th className="px-4 py-3">Amount & Method</th>
                  <th className="px-4 py-3">Mapped State</th>
                  <th className="px-4 py-3">Source & Notes</th>
                  <th className="px-4 py-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                      No payment transaction attempts found.
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((tx) => (
                    <tr key={tx._id} className="hover:bg-slate-50/70">
                      <td className="px-4 py-3 whitespace-nowrap font-mono font-semibold text-slate-900">
                        {tx.order?.orderNumber ||
                          (tx.order?._id ? `#${tx.order._id.slice(-8).toUpperCase()}` : "—")}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-slate-800">
                          {tx.user?.name || "Customer"}
                        </p>
                        <p className="text-[11px] text-slate-500">{tx.user?.email || "—"}</p>
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px]">
                        <p className="text-slate-800">{tx.gatewayPaymentId || "pending_pay_id"}</p>
                        <p className="text-slate-400">{tx.gatewayOrderId}</p>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <p className="font-bold text-slate-900">
                          ₹{Number(tx.amount || 0).toLocaleString("en-IN")}
                        </p>
                        <p className="uppercase text-[11px] text-slate-500">
                          {tx.method || "upi"}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                            STATE_BADGE_MAP[tx.mappedStatus] ||
                            "bg-slate-100 text-slate-700 border-slate-200"
                          }`}
                        >
                          {tx.mappedStatus}
                        </span>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          Gateway: {tx.gatewayStatus || "—"}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-slate-700 font-medium">{tx.source}</p>
                        {tx.failureReason && (
                          <p className="text-rose-700 text-[11px] max-w-[240px] truncate" title={tx.failureReason}>
                            {tx.failureReason}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-slate-600">
                        {formatDateTime(tx.updatedAt || tx.createdAt)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Payment Issue Logs */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
              <AlertTriangle size={16} className="text-amber-600" />
              <h2 className="text-sm font-bold text-slate-800">
                Payment Issue & Anomaly Logs ({overview.issueLogs.length})
              </h2>
            </div>
            <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
              {overview.issueLogs.length === 0 ? (
                <p className="p-6 text-xs text-slate-400 text-center">No payment issues logged.</p>
              ) : (
                overview.issueLogs.map((issue) => (
                  <div key={issue._id} className="p-4 flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-900">
                          {issue.orderNumber || `#${issue._id.slice(-8).toUpperCase()}`}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                            STATE_BADGE_MAP[issue.paymentState] ||
                            "bg-slate-100 text-slate-700 border-slate-200"
                          }`}
                        >
                          {issue.paymentState}
                        </span>
                        <span className="text-xs font-semibold text-slate-700">
                          ₹{issue.totalAmount}
                        </span>
                      </div>
                      {issue.requiresReviewReason && (
                        <p className="text-xs text-orange-800">{issue.requiresReviewReason}</p>
                      )}
                      {issue.paymentFailureReason && (
                        <p className="text-xs text-rose-700">{issue.paymentFailureReason}</p>
                      )}
                      {issue.fulfillmentNote && (
                        <p className="text-[11px] text-slate-600">{issue.fulfillmentNote}</p>
                      )}
                      <p className="text-[10px] text-slate-400">
                        Reconcile attempts: {issue.reconcileAttempts || 0} •{" "}
                        {formatDateTime(issue.updatedAt)}
                      </p>
                    </div>
                    <button
                      onClick={() => handleManualReconcile(issue._id)}
                      disabled={reconcilingId === issue._id}
                      className="shrink-0 px-2.5 py-1.5 rounded-md bg-blue-50 hover:bg-blue-100 text-[#2874f0] border border-blue-200 text-xs font-semibold"
                    >
                      Reconcile
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Durable Webhook Events */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
              <Webhook size={16} className="text-[#0d2a46]" />
              <h2 className="text-sm font-bold text-slate-800">
                Recent Webhook Deliveries ({overview.recentWebhooks.length})
              </h2>
            </div>
            <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
              {overview.recentWebhooks.length === 0 ? (
                <p className="p-6 text-xs text-slate-400 text-center">No webhook events recorded yet.</p>
              ) : (
                overview.recentWebhooks.map((evt) => (
                  <div key={evt._id} className="p-4 space-y-1 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-slate-900">{evt.eventType}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          evt.status === "processed"
                            ? "bg-emerald-50 text-emerald-700"
                            : evt.status === "failed" || evt.status === "dead_letter"
                            ? "bg-rose-50 text-rose-700"
                            : evt.status === "processing"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {evt.status}
                      </span>
                    </div>
                    <p className="font-mono text-[11px] text-slate-500 truncate">
                      Event ID: {evt.eventId}
                    </p>
                    {evt.errorMessage && (
                      <p className="text-[11px] text-rose-700">{evt.errorMessage}</p>
                    )}
                    <p className="text-[10px] text-slate-400">
                      Received: {formatDateTime(evt.createdAt)} • Attempts:{" "}
                      {evt.processingAttempts || 0}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Payment Attempt History Modal */}
      {historyModal.open && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 max-w-2xl w-full max-h-[85vh] flex flex-col shadow-xl">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Payment Attempt History
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 font-mono">
                  {historyModal.order?.orderNumber || historyModal.order?._id} • State:{" "}
                  {historyModal.order?.paymentState}
                </p>
              </div>
              <button
                onClick={() =>
                  setHistoryModal({ open: false, order: null, transactions: [], loading: false })
                }
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-3">
              {(historyModal.order?.requiresReviewReason ||
                historyModal.order?.paymentFailureReason ||
                historyModal.order?.fulfillmentNote) && (
                <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
                  {historyModal.order.requiresReviewReason && (
                    <p>
                      <strong>Review Reason:</strong> {historyModal.order.requiresReviewReason}
                    </p>
                  )}
                  {historyModal.order.paymentFailureReason && (
                    <p>
                      <strong>Failure Reason:</strong> {historyModal.order.paymentFailureReason}
                    </p>
                  )}
                  {historyModal.order.fulfillmentNote && (
                    <p>
                      <strong>Fulfillment Note:</strong> {historyModal.order.fulfillmentNote}
                    </p>
                  )}
                </div>
              )}

              {historyModal.loading ? (
                <p className="text-xs text-slate-500 text-center py-8">Loading attempts...</p>
              ) : historyModal.transactions.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-8">
                  No gateway transaction records logged for this order.
                </p>
              ) : (
                historyModal.transactions.map((tx) => (
                  <div
                    key={tx._id}
                    className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 space-y-1.5 text-xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                          STATE_BADGE_MAP[tx.mappedStatus] ||
                          "bg-slate-100 text-slate-700 border-slate-200"
                        }`}
                      >
                        {tx.mappedStatus}
                      </span>
                      <span className="text-slate-500">
                        {formatDateTime(tx.updatedAt || tx.createdAt)}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px] text-slate-600 font-mono">
                      <p>Order: {tx.gatewayOrderId}</p>
                      <p>Payment: {tx.gatewayPaymentId || "pending"}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-700">
                      <span>Amount: ₹{tx.amount}</span>
                      <span className="uppercase">Method: {tx.method || "upi"}</span>
                      <span>Source: {tx.source}</span>
                      {tx.gatewayStatus && <span>Gateway: {tx.gatewayStatus}</span>}
                    </div>
                    {tx.failureReason && (
                      <p className="text-[11px] text-rose-700">Error: {tx.failureReason}</p>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="px-5 py-3 border-t border-slate-200 flex items-center justify-end gap-2 bg-slate-50 rounded-b-xl">
              <button
                onClick={() => handleManualReconcile(historyModal.order?._id)}
                disabled={!historyModal.order?._id || reconcilingId === historyModal.order?._id}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0d2a46] hover:bg-[#163a5c] text-white text-xs font-semibold disabled:opacity-50"
              >
                <RefreshCw
                  size={12}
                  className={reconcilingId === historyModal.order?._id ? "animate-spin" : ""}
                />
                Manual Reconcile Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payments;

