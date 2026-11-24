import React, { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { ExternalLink, LogOut, Menu, X } from "lucide-react";
import fbb from "../Layouts/Img/fbb.png";
import { cn } from "../../lib/util";

export interface PanelNavItem {
  label: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

interface Props {
  area: "Admin" | "Seller";
  nav: PanelNavItem[];
  onLogout: () => void;
  account?: { name?: string; email?: string };
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

/** Shared shell for the admin and seller panels: dark sidebar, sticky top bar, content area. */
const PanelLayout: React.FC<Props> = ({ area, nav, onLogout, account, title, subtitle, actions, children }) => {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (title) document.title = `${title} · FBB ${area}`;
  }, [title, area]);

  const sidebar = (
    <div className="flex h-full flex-col bg-ink text-white">
      <div className="flex h-16 items-center justify-between px-5">
        <Link to={area === "Admin" ? "/admin" : "/seller/dashboard"} className="flex items-center gap-3">
          <img src={fbb} alt="FBB" className="h-8 w-auto" />
          <span className="rounded bg-white/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-white/80">{area}</span>
        </Link>
        <button onClick={() => setOpen(false)} className="grid h-9 w-9 place-items-center rounded-md hover:bg-white/10 lg:hidden" aria-label="Close menu">
          <X className="h-5 w-5" />
        </button>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label={`${area} navigation`}>
        <ul className="space-y-1">
          {nav.map(({ label, to, icon: Icon, badge }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={to === "/admin" || to.endsWith("/dashboard")}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition",
                    isActive ? "bg-white text-ink" : "text-white/70 hover:bg-white/10 hover:text-white"
                  )
                }
              >
                <Icon className="h-[18px] w-[18px]" />
                <span className="flex-1">{label}</span>
                {!!badge && <span className="rounded-full bg-brand px-2 py-0.5 text-[11px] font-bold text-white">{badge}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="border-t border-white/10 p-3">
        <a href="/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-white/70 hover:bg-white/10 hover:text-white">
          <ExternalLink className="h-[18px] w-[18px]" /> View store
        </a>
        <button onClick={onLogout} className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm text-white/70 hover:bg-white/10 hover:text-white">
          <LogOut className="h-[18px] w-[18px]" /> Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-canvas text-ink">
      {/* desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 lg:block">{sidebar}</aside>

      {/* mobile sidebar */}
      <div className={cn("fixed inset-0 z-50 lg:hidden", open ? "visible" : "pointer-events-none invisible")}>
        <div onClick={() => setOpen(false)} className={cn("absolute inset-0 bg-black/50 transition-opacity", open ? "opacity-100" : "opacity-0")} />
        <aside className={cn("absolute inset-y-0 left-0 w-72 transition-transform duration-300", open ? "translate-x-0" : "-translate-x-full")}>{sidebar}</aside>
      </div>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-white/90 px-4 backdrop-blur sm:px-6 lg:px-8">
          <button onClick={() => setOpen(true)} className="-ml-2 grid h-10 w-10 place-items-center rounded-md hover:bg-canvas lg:hidden" aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </button>
          <p className="truncate text-sm text-muted">
            FBB Store <span className="mx-1">/</span> <span className="font-medium text-ink">{title || area}</span>
          </p>
          {account?.name && (
            <div className="ml-auto flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-semibold leading-tight">{account.name}</p>
                {account.email && <p className="text-xs text-muted">{account.email}</p>}
              </div>
              <span className="grid h-9 w-9 place-items-center rounded-full bg-ink text-sm font-semibold uppercase text-white">{account.name.charAt(0)}</span>
            </div>
          )}
        </header>

        <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {(title || actions) && (
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                {title && <h1 className="font-display text-2xl font-semibold uppercase sm:text-3xl">{title}</h1>}
                {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
              </div>
              {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
};

export default PanelLayout;

/* ------------------------------------------------- shared panel UI */

export const Card: React.FC<React.PropsWithChildren<{ className?: string; title?: string; action?: React.ReactNode }>> = ({
  className,
  title,
  action,
  children,
}) => (
  <section className={cn("rounded-lg border border-line bg-white", className)}>
    {(title || action) && (
      <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
        {title && <h2 className="text-sm font-semibold uppercase tracking-wider">{title}</h2>}
        {action}
      </div>
    )}
    {children}
  </section>
);

export const StatCard: React.FC<{ label: string; value: React.ReactNode; hint?: React.ReactNode; icon?: React.ComponentType<{ className?: string }> }> = ({
  label,
  value,
  hint,
  icon: Icon,
}) => (
  <div className="rounded-lg border border-line bg-white p-5">
    <div className="flex items-center justify-between">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted">{label}</p>
      {Icon && <Icon className="h-5 w-5 text-muted" />}
    </div>
    <p className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">{value}</p>
    {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
  </div>
);

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-50 text-amber-800 ring-amber-200",
  accepted: "bg-sky-50 text-sky-800 ring-sky-200",
  processing: "bg-sky-50 text-sky-800 ring-sky-200",
  partially_shipped: "bg-indigo-50 text-indigo-800 ring-indigo-200",
  shipped: "bg-indigo-50 text-indigo-800 ring-indigo-200",
  delivered: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  completed: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  cancelled: "bg-red-50 text-red-700 ring-red-200",
  failed: "bg-red-50 text-red-700 ring-red-200",
  returned: "bg-zinc-100 text-zinc-700 ring-zinc-200",
  refunded: "bg-zinc-100 text-zinc-700 ring-zinc-200",
  active: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  inactive: "bg-zinc-100 text-zinc-700 ring-zinc-200",
};

export const StatusPill: React.FC<{ status?: string; className?: string }> = ({ status = "pending", className }) => (
  <span
    className={cn(
      "inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ring-1 ring-inset",
      STATUS_STYLES[status] || "bg-canvas text-ink ring-line",
      className
    )}
  >
    {status.replace(/_/g, " ")}
  </span>
);

export const panelBtn = {
  primary:
    "inline-flex items-center justify-center gap-2 rounded-md bg-ink px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50",
  secondary:
    "inline-flex items-center justify-center gap-2 rounded-md border border-line bg-white px-4 py-2.5 text-sm font-semibold text-ink transition hover:border-ink disabled:cursor-not-allowed disabled:opacity-50",
  danger:
    "inline-flex items-center justify-center gap-2 rounded-md border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-50",
};
