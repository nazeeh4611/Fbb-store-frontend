import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, Loader2, Search, X } from "lucide-react";
import { AdminLayout } from "./Sidebar";
import { Card, StatusPill, panelBtn } from "../Panel/PanelLayout";
import api, { errorMessage } from "../../lib/api";
import { formatINR } from "../../lib/format";
import { cn } from "../../lib/util";

interface OrderItem {
  _id: string;
  product?: { _id: string; name: string; images?: { image1?: string }; sku?: string };
  seller?: { _id: string; name?: string; companyName?: string; email?: string; phone?: string };
  quantity: number;
  price: number;
  selectedColor?: string;
  selectedSize?: string;
  itemStatus?: string;
  sellerStatus?: string;
  returnStatus?: string;
}
interface Address { name?: string; phone?: string; email?: string; street?: string; city?: string; state?: string; pincode?: string; country?: string }
interface Order {
  _id: string;
  orderId: string;
  user?: { name?: string; email?: string; phone?: string };
  items: OrderItem[];
  shippingAddress?: Address;
  paymentMethod: string;
  paymentStatus: string;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  status: string;
  createdAt: string;
  refundAmount?: number;
}

const STATUSES = ["all", "pending", "accepted", "processing", "shipped", "delivered", "cancelled", "returned"];

const OrderDrawer: React.FC<{ orderId: string | null; onClose: () => void }> = ({ orderId, onClose }) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!orderId) return;
    setOrder(null);
    setError("");
    api
      .get(`/admin/orders/${orderId}`)
      .then((r) => setOrder(r.data.order))
      .catch((e) => setError(errorMessage(e, "Couldn't load order")));
  }, [orderId]);

  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [onClose]);

  const a = order?.shippingAddress;
  return (
    <div className={cn("fixed inset-0 z-50", orderId ? "visible" : "pointer-events-none invisible")}>
      <div onClick={onClose} className={cn("absolute inset-0 bg-black/40 transition-opacity", orderId ? "opacity-100" : "opacity-0")} />
      <aside className={cn("absolute inset-y-0 right-0 flex w-full max-w-xl flex-col bg-white shadow-2xl transition-transform duration-300", orderId ? "translate-x-0" : "translate-x-full")}>
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted">Order</p>
            <p className="font-mono text-sm font-semibold">{orderId}</p>
          </div>
          <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-md hover:bg-canvas" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          {error ? (
            <p className="text-sm text-sale">{error}</p>
          ) : !order ? (
            <div className="grid h-40 place-items-center"><Loader2 className="h-6 w-6 animate-spin text-muted" /></div>
          ) : (
            <div className="space-y-6 text-sm">
              <div className="flex flex-wrap items-center gap-2">
                <StatusPill status={order.status} />
                <StatusPill status={order.paymentStatus} />
                <span className="text-muted">{order.paymentMethod === "cod" ? "Cash on delivery" : "Paid online (Razorpay)"}</span>
                <span className="ml-auto text-muted">{new Date(order.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-md bg-canvas p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted">Customer</p>
                  <p className="mt-2 font-semibold">{order.user?.name || a?.name}</p>
                  <p className="text-muted">{order.user?.email || a?.email}</p>
                  <p className="text-muted">{a?.phone || order.user?.phone}</p>
                </div>
                <div className="rounded-md bg-canvas p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted">Ship to</p>
                  <p className="mt-2 font-semibold">{a?.name}</p>
                  <p className="text-muted">{[a?.street, a?.city, a?.state, a?.pincode].filter(Boolean).join(", ")}</p>
                  <p className="text-muted">{a?.country}</p>
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">Items</p>
                <ul className="divide-y divide-line rounded-md border border-line">
                  {order.items.map((i) => (
                    <li key={i._id} className="flex gap-3 p-3">
                      {i.product?.images?.image1 ? <img src={i.product.images.image1} alt="" className="h-16 w-12 rounded object-cover" /> : <span className="h-16 w-12 rounded bg-canvas" />}
                      <div className="min-w-0 flex-1">
                        <p className="font-medium">{i.product?.name || "Removed product"}</p>
                        <p className="text-xs text-muted">
                          {[i.selectedColor, i.selectedSize && `Size ${i.selectedSize}`, `Qty ${i.quantity}`].filter(Boolean).join(" · ")}
                        </p>
                        <p className="text-xs text-muted">Seller: {i.seller?.companyName || i.seller?.name || "—"}</p>
                        <div className="mt-1 flex flex-wrap gap-1">
                          <StatusPill status={i.itemStatus || i.sellerStatus} />
                          {i.returnStatus && <StatusPill status={`return ${i.returnStatus}`} />}
                        </div>
                      </div>
                      <p className="font-semibold">{formatINR(i.price * i.quantity)}</p>
                    </li>
                  ))}
                </ul>
              </div>

              <dl className="space-y-2 rounded-md bg-canvas p-4">
                <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd>{formatINR(order.subtotal)}</dd></div>
                <div className="flex justify-between"><dt className="text-muted">Shipping</dt><dd>{order.shipping ? formatINR(order.shipping) : "Free"}</dd></div>
                <div className="flex justify-between"><dt className="text-muted">GST</dt><dd>{formatINR(order.tax)}</dd></div>
                {!!order.refundAmount && <div className="flex justify-between text-sale"><dt>Refunded</dt><dd>-{formatINR(order.refundAmount)}</dd></div>}
                <div className="flex justify-between border-t border-line pt-2 text-base font-bold"><dt>Total</dt><dd>{formatINR(order.total)}</dd></div>
              </dl>
              <p className="text-xs text-muted">Sellers update fulfilment status from their dashboards; changes appear here automatically.</p>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
};

const AdminOrders: React.FC = () => {
  const [params, setParams] = useSearchParams();
  const status = params.get("status") || "all";
  const payment = params.get("payment") || "";
  const page = Number(params.get("page")) || 1;
  const [q, setQ] = useState(params.get("q") || "");
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const open = params.get("open");

  const set = (k: string, v: string | null) => {
    const n = new URLSearchParams(params);
    v ? n.set(k, v) : n.delete(k);
    if (k !== "page" && k !== "open") n.delete("page");
    setParams(n, { replace: true });
  };

  useEffect(() => {
    const t = setTimeout(() => {
      if ((params.get("q") || "") !== q) set("q", q.trim() || null);
    }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError("");
    api
      .get("/admin/orders", { params: { page, limit: 20, status: status === "all" ? undefined : status, payment: payment || undefined, search: params.get("q") || undefined } })
      .then((r) => {
        if (!alive) return;
        setOrders(r.data.orders || []);
        setTotal(r.data.total || 0);
        setPages(r.data.totalPages || 1);
      })
      .catch((e) => alive && setError(errorMessage(e, "Couldn't load orders")))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [status, payment, page, params]);

  return (
    <AdminLayout title="Orders" subtitle={`${total} ${total === 1 ? "order" : "orders"}`}>
      <Card>
        <div className="flex flex-col gap-3 border-b border-line p-4 lg:flex-row lg:items-center">
          <div className="no-scrollbar -mx-1 flex gap-1 overflow-x-auto px-1">
            {STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => set("status", s === "all" ? null : s)}
                className={cn("whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-medium capitalize", status === s ? "bg-ink text-white" : "text-ink-soft hover:bg-canvas")}
              >
                {s}
              </button>
            ))}
          </div>
          <div className="flex gap-2 lg:ml-auto">
            <select value={payment} onChange={(e) => set("payment", e.target.value || null)} className="field w-auto py-2" aria-label="Payment method">
              <option value="">All payments</option>
              <option value="cod">Cash on delivery</option>
              <option value="razorpay">Online</option>
            </select>
            <label className="relative w-full lg:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Order ID, name, email, phone" className="field py-2 pl-9" aria-label="Search orders" />
            </label>
          </div>
        </div>

        {error ? (
          <p className="p-8 text-center text-sm text-sale">{error}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs uppercase tracking-wider text-muted">
                  <th className="px-4 py-3 font-semibold">Order</th>
                  <th className="px-4 py-3 font-semibold">Customer</th>
                  <th className="px-4 py-3 font-semibold">Items</th>
                  <th className="px-4 py-3 font-semibold">Payment</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 text-right font-semibold">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {loading
                  ? Array.from({ length: 6 }).map((_, i) => (
                      <tr key={i}>
                        <td colSpan={6} className="px-4 py-3"><div className="skeleton h-9 w-full" /></td>
                      </tr>
                    ))
                  : orders.length === 0
                  ? (
                      <tr><td colSpan={6} className="px-4 py-16 text-center text-muted">No orders match these filters.</td></tr>
                    )
                  : orders.map((o) => (
                      <tr key={o._id} onClick={() => set("open", o.orderId)} className="cursor-pointer hover:bg-canvas">
                        <td className="px-4 py-3">
                          <p className="font-mono text-xs font-semibold">{o.orderId}</p>
                          <p className="text-xs text-muted">{new Date(o.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium">{o.user?.name || o.shippingAddress?.name}</p>
                          <p className="text-xs text-muted">{o.shippingAddress?.city}{o.shippingAddress?.state ? `, ${o.shippingAddress.state}` : ""}</p>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex -space-x-2">
                            {o.items.slice(0, 3).map((i) =>
                              i.product?.images?.image1 ? (
                                <img key={i._id} src={i.product.images.image1} alt="" className="h-9 w-9 rounded-full border-2 border-white object-cover" />
                              ) : (
                                <span key={i._id} className="h-9 w-9 rounded-full border-2 border-white bg-canvas" />
                              )
                            )}
                          </div>
                          <p className="mt-1 text-xs text-muted">{o.items.reduce((n, i) => n + i.quantity, 0)} units</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-xs">{o.paymentMethod === "cod" ? "COD" : "Online"}</p>
                          <StatusPill status={o.paymentStatus} className="mt-1" />
                        </td>
                        <td className="px-4 py-3"><StatusPill status={o.status} /></td>
                        <td className="px-4 py-3 text-right font-semibold">{formatINR(o.total)}</td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        )}

        {pages > 1 && (
          <div className="flex items-center justify-between border-t border-line px-4 py-3 text-sm">
            <span className="text-muted">Page {page} of {pages}</span>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => set("page", String(page - 1))} className={panelBtn.secondary}><ChevronLeft className="h-4 w-4" /> Prev</button>
              <button disabled={page >= pages} onClick={() => set("page", String(page + 1))} className={panelBtn.secondary}>Next <ChevronRight className="h-4 w-4" /></button>
            </div>
          </div>
        )}
      </Card>

      <OrderDrawer orderId={open} onClose={() => set("open", null)} />
    </AdminLayout>
  );
};

export default AdminOrders;
