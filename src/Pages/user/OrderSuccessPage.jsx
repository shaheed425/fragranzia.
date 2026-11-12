import { CheckCircle2, Package, Truck, Home, ArrowRight, ReceiptText, MessageCircle, FileText } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

export default function OrderSuccessPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const order = location.state?.order;
  const address = location.state?.address;

  const orderId = order?._id ? `#${order._id.slice(-8).toUpperCase()}` : "Confirmed";
  const estimatedDelivery = "2–4 business days";

  const supportPhone = import.meta.env.VITE_WHATSAPP_NUMBER || "918590315711";
  const cleanSupportPhone = String(supportPhone).replace(/\D/g, "");
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
  const invoicePdfUrl = order?._id ? `${backendUrl}/api/order/invoice/${order._id}` : null;

  const orderRef =
    order?.orderNumber || (order?._id ? `#${order._id.slice(-8).toUpperCase()}` : orderId);
  const amountStr = order?.totalAmount ? ` (₹${order.totalAmount})` : "";
  const customerName = address?.fullName ? `${address.fullName}` : "";

  const itemsSource =
    Array.isArray(order?.orderItems) && order.orderItems.length > 0
      ? order.orderItems
      : location.state?.cartItems || [];

  const itemsText = itemsSource
    .map((item) => {
      const p = item.product || {};
      const pName =
        (typeof p === "object" ? p.name || p.title : null) ||
        item.name ||
        item.title ||
        "Fragrance";
      const pBrand = typeof p === "object" && p.brand ? ` [${p.brand}]` : "";
      const pSize = item.size ? ` (${item.size})` : "";
      const pQty = item.quantity || 1;
      const pPrice = item.price ? ` — ₹${item.price * pQty}` : "";
      return `• ${pName}${pBrand}${pSize} x${pQty}${pPrice}`;
    })
    .join("\n");

  const addressLine = address
    ? [address.street, address.city, address.state, address.zip ? `- ${address.zip}` : ""]
        .filter(Boolean)
        .join(", ")
    : "";

  const whatsappMsg = [
    `✨ *Official Order Invoice — Fragranzia*`,
    `Hi Fragranzia, I placed order *${orderRef}*${amountStr}!`,
    customerName ? `*Customer:* ${customerName}` : null,
    address?.phone ? `*Phone:* ${address.phone}` : null,
    addressLine ? `*Delivery Address:* ${addressLine}` : null,
    itemsText ? `\n*Products Ordered:*\n${itemsText}` : null,
    invoicePdfUrl ? `\n📄 *Official PDF Invoice:*\n${invoicePdfUrl}` : null,
    `\nPlease confirm dispatch & tracking updates. Thank you!`,
  ]
    .filter(Boolean)
    .join("\n");

  const whatsappLink = `https://wa.me/${cleanSupportPhone}?text=${encodeURIComponent(whatsappMsg)}`;

  return (
    <div className="min-h-screen flex flex-col bg-[#f1f3f6] text-slate-900">
      <main className="flex-1 max-w-4xl w-full mx-auto px-3 sm:px-6 py-6 sm:py-10 space-y-4">
        {/* Confirmation Card */}
        <section className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                Order Confirmed
              </p>
              <h1 className="text-2xl font-bold text-slate-900 mt-0.5">
                Thank you for shopping with Fragranzia
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                We have received your order and will keep you updated as it ships.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Order ID
              </p>
              <p className="mt-1 font-mono text-sm font-bold text-slate-900">{orderId}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Estimated Delivery
              </p>
              <p className="mt-1 text-sm font-bold text-slate-900">{estimatedDelivery}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-1">
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-[#25D366] hover:bg-[#20bd5a] px-5 py-2.5 text-sm font-bold text-white transition shadow-xs"
            >
              <MessageCircle className="h-4 w-4 fill-current" />
              Chat on WhatsApp
            </a>
            {invoicePdfUrl && (
              <a
                href={invoicePdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition shadow-xs"
              >
                <FileText className="h-4 w-4 text-[#0d2a46]" />
                Download Invoice (PDF)
              </a>
            )}
            <button
              type="button"
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-2 rounded-lg bg-[#0d2a46] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#163d61] transition"
            >
              Continue Shopping
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => navigate("/orderdetails")}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              <ReceiptText className="h-4 w-4" />
              View My Orders
            </button>
          </div>
        </section>

        {/* WhatsApp Fast Update Card */}
        <section className="rounded-xl border border-emerald-200 bg-gradient-to-r from-emerald-50 via-teal-50 to-white p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#25D366] text-white flex items-center justify-center shrink-0 shadow-xs">
              <MessageCircle className="w-5 h-5 fill-current" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">
                Want instant updates or have a question?
              </p>
              <p className="text-xs text-slate-600 mt-0.5">
                Reach the Fragranzia team directly on WhatsApp for expedited dispatch and queries.
              </p>
            </div>
          </div>
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#25D366] hover:bg-[#20bd5a] text-white px-4 py-2 text-xs font-bold transition shadow-xs shrink-0"
          >
            <MessageCircle className="h-4 w-4 fill-current" />
            Message Us on WhatsApp
          </a>
        </section>

        {/* Next Steps */}
        <section className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900">Order Progress</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                icon: CheckCircle2,
                title: "Confirmed",
                text: "Your order has been received.",
                active: true,
              },
              {
                icon: Package,
                title: "Packed",
                text: "Your fragrance is carefully packed.",
                active: false,
              },
              {
                icon: Truck,
                title: "Out for Delivery",
                text: "On the way to your address.",
                active: false,
              },
            ].map((step) => (
              <div
                key={step.title}
                className={`rounded-lg border p-4 ${
                  step.active
                    ? "border-emerald-200 bg-emerald-50/70"
                    : "border-slate-200 bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-2">
                  <step.icon
                    className={`h-4 w-4 ${step.active ? "text-emerald-700" : "text-slate-400"}`}
                  />
                  <h3 className="text-sm font-bold text-slate-900">{step.title}</h3>
                </div>
                <p className="mt-1.5 text-xs text-slate-600">{step.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Delivery Address Summary */}
        <section className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <Home className="h-4 w-4 text-[#0d2a46]" />
            Delivery Address
          </div>
          {address ? (
            <div className="text-sm text-slate-600 space-y-0.5">
              <p className="font-semibold text-slate-900">{address.fullName}</p>
              <p>
                {address.street}, {address.city}, {address.state} - {address.zip}, {address.country}
              </p>
              <p className="text-xs font-medium text-slate-700 pt-1">Phone: {address.phone}</p>
            </div>
          ) : (
            <p className="text-xs text-slate-500">
              Full delivery address details are available in your order history.
            </p>
          )}
        </section>
      </main>
    </div>
  );
}
