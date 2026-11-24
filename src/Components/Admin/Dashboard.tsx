import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, IndianRupee, Package, RefreshCw, ShoppingCart, Store, Users } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AdminLayout } from "./Sidebar";
import { Card, StatCard, StatusPill, panelBtn } from "../Panel/PanelLayout";
import api, { errorMessage } from "../../lib/api";
import { formatINR } from "../../lib/format";

interface DashboardData {
  stats: { revenue: number; orders: number; paidOrders: number; products: number; activeProducts: number; sellers: number; pendingSellers: number; customers: number };
  statusCounts: Record<string, number>;
  series: { date: string; revenue: number; orders: number }[];
  recentOrders: { _id: string; orderId: string; total: number; status: string; paymentMethod: string; createdAt: string; itemCount: number; user?: { name?: string; email?: string }; shippingAddress?: { name?: string } }[];
  lowStock: { _id: string; name: string; stock: number; images?: { image1?: string }; seller?: { name?: string; companyName?: string } }[];
  topProducts: { _id: string; name?: string; image?: string; units: number; revenue: number }[];
}

const shortDate = (d: string) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" });

const ChartTooltip = ({ active, payload, label }: any) =>
  active && payload?.length ? (
    <div className="rounded-md border border-line bg-white px-3 py-2 text-xs shadow-lg">
      <p className="font-semibold">{shortDate(label)}</p>
      <p className="mt-1 text-ink-soft">Revenue: <span className="font-semibold text-ink">{formatINR(payload[0].payload.revenue)}</span></p>
      <p className="text-ink-soft">Orders: <span className="font-semibold text-ink">{payload[0].payload.orders}</span></p>
    </div>
  ) : null;

const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const r = await api.get("/admin/dashboard");
      setData(r.data);
    } catch (err) {
      setError(errorMessage(err, "Couldn't load the dashboard"));
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, []);

  const s = data?.stats;
  const last30 = data?.series.reduce((t, d) => t + d.revenue, 0) || 0;
  const pipeline = ["pending", "accepted", "processing", "shipped", "delivered", "cancelled"];

  return (
    <AdminLayout
      title="Dashboard"
      subtitle="Store performance at a glance"
      actions={
        <button onClick={load} className={panelBtn.secondary} disabled={loading}>
          <RefreshCw className={loading ? "h-4 w-4 animate-spin" : "h-4 w-4"} /> Refresh
        </button>
      }
    >
      {error && (
        <div className="mb-6 rounded-md border border-red-200 bg-sale-soft px-4 py-3 text-sm text-sale">
          {error}{" "}
          <button onClick={load} className="font-semibold underline">Try again</button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {loading && !data ? (
          [0, 1, 2, 3].map((i) => <div key={i} className="skeleton h-[118px] rounded-lg" />)
        ) : (
          <>
            <StatCard label="Revenue" icon={IndianRupee} value={formatINR(s?.revenue)} hint={`${formatINR(last30)} in the last 30 days`} />
            <StatCard label="Orders" icon={ShoppingCart} value={s?.orders ?? 0} hint={`${data?.statusCounts.pending || 0} awaiting action`} />
            <StatCard label="Products" icon={Package} value={s?.products ?? 0} hint={`${s?.activeProducts ?? 0} live in store`} />
            <StatCard
              label="Sellers"
              icon={Store}
              value={s?.sellers ?? 0}
              hint={
                s?.pendingSellers ? (
                  <Link to="/admin/sellers" className="font-semibold text-brand underline">{s.pendingSellers} awaiting approval</Link>
                ) : (
                  `${s?.customers ?? 0} registered customers`
                )
              }
            />
          </>
        )}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Card title="Revenue · last 30 days" className="xl:col-span-2">
          <div className="h-72 px-2 pb-4 pt-6">
            {data ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.series} margin={{ left: 8, right: 16 }} barCategoryGap={2}>
                  <CartesianGrid vertical={false} stroke="#ececec" />
                  <XAxis dataKey="date" tickFormatter={shortDate} tick={{ fontSize: 11, fill: "#6b6b6b" }} tickLine={false} axisLine={{ stroke: "#e6e6e6" }} interval="preserveStartEnd" minTickGap={24} />
                  <YAxis tickFormatter={(v) => (v >= 1000 ? `₹${(v / 1000).toFixed(v < 10000 ? 1 : 0).replace(/\.0$/, "")}k` : `₹${v}`)} tick={{ fontSize: 11, fill: "#6b6b6b" }} tickLine={false} axisLine={false} width={52} />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(17,17,17,0.05)" }} />
                  <Bar dataKey="revenue" fill="#111111" radius={[4, 4, 0, 0]} maxBarSize={18} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="skeleton h-full w-full" />
            )}
          </div>
        </Card>

        <Card title="Order pipeline">
          <ul className="divide-y divide-line">
            {pipeline.map((st) => (
              <li key={st}>
                <Link to={`/admin/orders?status=${st}`} className="flex items-center justify-between px-5 py-3 hover:bg-canvas">
                  <StatusPill status={st} />
                  <span className="text-sm font-semibold">{data?.statusCounts[st] ?? "–"}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Card title="Recent orders" className="xl:col-span-2" action={<Link to="/admin/orders" className="text-sm font-semibold underline">View all</Link>}>
          {data && data.recentOrders.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-muted">No orders yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-sm">
                <thead>
                  <tr className="border-b border-line text-left text-xs uppercase tracking-wider text-muted">
                    <th className="px-5 py-3 font-semibold">Order</th>
                    <th className="px-5 py-3 font-semibold">Customer</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                    <th className="px-5 py-3 text-right font-semibold">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {(data?.recentOrders || []).map((o) => (
                    <tr key={o._id} className="hover:bg-canvas">
                      <td className="px-5 py-3">
                        <Link to={`/admin/orders?open=${o.orderId}`} className="font-mono text-xs font-semibold hover:underline">{o.orderId}</Link>
                        <p className="text-xs text-muted">{new Date(o.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</p>
                      </td>
                      <td className="px-5 py-3">
                        <p className="font-medium">{o.user?.name || o.shippingAddress?.name || "Customer"}</p>
                        <p className="text-xs text-muted">{o.itemCount} items · {o.paymentMethod === "cod" ? "COD" : "Online"}</p>
                      </td>
                      <td className="px-5 py-3"><StatusPill status={o.status} /></td>
                      <td className="px-5 py-3 text-right font-semibold">{formatINR(o.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <div className="space-y-6">
          <Card title="Best sellers">
            {data && data.topProducts.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-muted">Sales will appear here.</p>
            ) : (
              <ul className="divide-y divide-line">
                {(data?.topProducts || []).map((p) => (
                  <li key={p._id} className="flex items-center gap-3 px-5 py-3">
                    {p.image ? <img src={p.image} alt="" className="h-11 w-9 rounded object-cover" /> : <span className="h-11 w-9 rounded bg-canvas" />}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{p.name || "Deleted product"}</p>
                      <p className="text-xs text-muted">{p.units} sold</p>
                    </div>
                    <span className="text-sm font-semibold">{formatINR(p.revenue)}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card title="Low stock">
            {data && data.lowStock.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-muted">All products are well stocked.</p>
            ) : (
              <ul className="divide-y divide-line">
                {(data?.lowStock || []).map((p) => (
                  <li key={p._id} className="flex items-center gap-3 px-5 py-3">
                    {p.images?.image1 ? <img src={p.images.image1} alt="" className="h-11 w-9 rounded object-cover" /> : <span className="h-11 w-9 rounded bg-canvas" />}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{p.name}</p>
                      <p className="text-xs text-muted">{p.seller?.companyName || p.seller?.name}</p>
                    </div>
                    <span className={p.stock <= 0 ? "flex items-center gap-1 text-xs font-semibold text-sale" : "text-xs font-semibold text-ink"}>
                      {p.stock <= 0 && <AlertTriangle className="h-3.5 w-3.5" />}
                      {p.stock <= 0 ? "Out of stock" : `${p.stock} left`}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>

      {s && (
        <p className="mt-6 flex items-center gap-2 text-xs text-muted">
          <Users className="h-3.5 w-3.5" /> {s.customers} registered customers · revenue counts paid online orders and cash-on-delivery orders that aren't cancelled or returned.
        </p>
      )}
    </AdminLayout>
  );
};

export default AdminDashboard;
