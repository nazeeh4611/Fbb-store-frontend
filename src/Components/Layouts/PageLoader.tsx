import React from "react";

/** Full-page loading state shown while a route chunk downloads. */
const PageLoader: React.FC<{ label?: string }> = ({ label = "Loading" }) => (
  <div className="min-h-[60vh] w-full flex flex-col items-center justify-center gap-4" role="status" aria-live="polite">
    <div className="relative h-12 w-12">
      <div className="absolute inset-0 rounded-full border-2 border-stone-200" />
      <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-amber-500 animate-spin" />
    </div>
    <p className="text-sm tracking-wide text-stone-500">{label}…</p>
  </div>
);

export default PageLoader;
