const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2, minimumFractionDigits: 0 });
const aed = new Intl.NumberFormat("en-AE", { style: "currency", currency: "AED", maximumFractionDigits: 2, minimumFractionDigits: 0 });

export const formatINR = (value: number | undefined | null) => inr.format(Number(value) || 0);
export const formatAED = (value: number | undefined | null) => aed.format(Number(value) || 0);

export interface Discountable {
  priceINR?: number;
  priceAED?: number;
  discount?: { percentage?: number; amount?: number; startDate?: string | null; endDate?: string | null };
}

/** Mirrors the backend pricing rules so displayed prices match what is charged. */
export const effectivePrice = (p: Discountable, currency: "INR" | "AED" = "INR"): { price: number; original: number; percentOff: number } => {
  const original = Number(currency === "AED" ? p.priceAED : p.priceINR) || 0;
  const d = p.discount;
  const now = Date.now();
  const active =
    !!d &&
    ((d.percentage ?? 0) > 0 || (d.amount ?? 0) > 0) &&
    (!d.startDate || new Date(d.startDate).getTime() <= now) &&
    (!d.endDate || new Date(d.endDate).getTime() >= now);
  if (!active || original <= 0) return { price: original, original, percentOff: 0 };
  let price = original;
  if ((d!.percentage ?? 0) > 0) price = original * (1 - (d!.percentage as number) / 100);
  else if ((d!.amount ?? 0) > 0 && currency === "INR") price = original - (d!.amount as number);
  price = Math.max(0, currency === "INR" ? Math.round(price) : Math.round(price * 100) / 100);
  return { price, original, percentOff: original > 0 ? Math.round((1 - price / original) * 100) : 0 };
};
