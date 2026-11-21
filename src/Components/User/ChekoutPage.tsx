import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  CreditCard,
  Truck,
  Shield,
  Lock,
  ChevronRight,
  MapPin,
  Loader2,
  ShoppingBag,
  RotateCcw,
  BadgeCheck,
} from "lucide-react";
import { toast } from "react-hot-toast";
import NavBar from "../Layouts/Navbar";
import Footer from "../Layouts/Footer";
import api, { errorMessage } from "../../lib/api";
import { openAuthModal } from "../../lib/auth";
import { formatINR } from "../../lib/format";

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface Address {
  name: string;
  phone: string;
  email: string;
  street: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
}

interface CartItem {
  _id: string;
  product: {
    _id: string;
    name: string;
    brand: string;
    priceINR: number;
    images: { image1: string };
  };
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
  price: number;
}

interface Summary {
  items: number;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
}

const EMPTY_ADDRESS: Address = {
  name: "",
  phone: "",
  email: "",
  street: "",
  city: "",
  state: "",
  country: "India",
  pincode: "",
};

const FIELDS: {
  name: keyof Address;
  label: string;
  type?: string;
  autoComplete: string;
  span?: boolean;
  inputMode?: "numeric" | "tel" | "email";
}[] = [
  { name: "name", label: "Full name", autoComplete: "name" },
  { name: "phone", label: "Mobile number", type: "tel", autoComplete: "tel", inputMode: "tel" },
  { name: "email", label: "Email (for order updates)", type: "email", autoComplete: "email", span: true, inputMode: "email" },
  { name: "street", label: "House no., building, street, area", autoComplete: "street-address", span: true },
  { name: "city", label: "City", autoComplete: "address-level2" },
  { name: "state", label: "State", autoComplete: "address-level1" },
  { name: "pincode", label: "PIN code", autoComplete: "postal-code", inputMode: "numeric" },
  { name: "country", label: "Country", autoComplete: "country-name" },
];

const REQUIRED: (keyof Address)[] = ["name", "phone", "street", "city", "state", "pincode"];
type Errors = Partial<Record<keyof Address, string>>;

const validateAddress = (a: Address): Errors => {
  const errors: Errors = {};
  REQUIRED.forEach((f) => {
    if (!a[f].trim()) errors[f] = "Required";
  });
  if (a.phone && !/^[0-9+\-\s]{7,15}$/.test(a.phone.trim())) errors.phone = "Enter a valid phone number";
  if (a.email && !/^\S+@\S+\.\S+$/.test(a.email.trim())) errors.email = "Enter a valid email";
  if (a.pincode && !/^[A-Za-z0-9\s-]{3,10}$/.test(a.pincode.trim())) errors.pincode = "Enter a valid PIN code";
  return errors;
};

const loadRazorpay = (): Promise<boolean> =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const existing = document.querySelector<HTMLScriptElement>('script[src*="checkout.razorpay.com"]');
    const script = existing || document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.addEventListener("load", () => resolve(true));
    script.addEventListener("error", () => resolve(false));
    if (!existing) document.body.appendChild(script);
  });

const AddressForm: React.FC<{
  value: Address;
  errors: Errors;
  onChange: (field: keyof Address, value: string) => void;
  idPrefix: string;
  hideEmail?: boolean;
}> = ({ value, errors, onChange, idPrefix, hideEmail }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
    {FIELDS.filter((f) => !(hideEmail && f.name === "email")).map((f) => (
      <div key={f.name} className={f.span ? "sm:col-span-2" : ""}>
        <label htmlFor={`${idPrefix}-${f.name}`} className="block text-sm font-medium text-stone-700 mb-1.5">
          {f.label}
          {REQUIRED.includes(f.name) && <span className="text-red-500"> *</span>}
        </label>
        <input
          id={`${idPrefix}-${f.name}`}
          type={f.type || "text"}
          inputMode={f.inputMode}
          autoComplete={f.autoComplete}
          value={value[f.name]}
          onChange={(e) => onChange(f.name, e.target.value)}
          aria-invalid={!!errors[f.name]}
          className={`w-full px-4 py-3 rounded-xl border bg-white text-stone-900 text-sm focus:outline-none focus:ring-2 transition ${
            errors[f.name]
              ? "border-red-400 focus:ring-red-200"
              : "border-stone-300 focus:ring-amber-500/30 focus:border-amber-500"
          }`}
        />
        {errors[f.name] && <p className="mt-1 text-xs text-red-600">{errors[f.name]}</p>}
      </div>
    ))}
  </div>
);

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const [loadingCart, setLoadingCart] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [summary, setSummary] = useState<Summary>({ items: 0, subtotal: 0, shipping: 0, tax: 0, total: 0 });
  const [paymentMethod, setPaymentMethod] = useState<"razorpay" | "cod">("razorpay");
  const [sameAsShipping, setSameAsShipping] = useState(true);
  const [saveAddress, setSaveAddress] = useState(true);
  const [shippingAddress, setShippingAddress] = useState<Address>(EMPTY_ADDRESS);
  const [billingAddress, setBillingAddress] = useState<Address>(EMPTY_ADDRESS);
  const [errors, setErrors] = useState<Errors>({});
  const [billingErrors, setBillingErrors] = useState<Errors>({});

  useEffect(() => {
    loadRazorpay();
    (async () => {
      try {
        const [cartRes, profileRes] = await Promise.allSettled([api.get("/cart"), api.get("/profile")]);
        if (cartRes.status === "fulfilled" && cartRes.value.data.success) {
          setCartItems(cartRes.value.data.cart || []);
          if (cartRes.value.data.summary) setSummary(cartRes.value.data.summary);
        } else if (cartRes.status === "rejected") {
          toast.error(errorMessage(cartRes.reason, "Failed to load your cart"));
        }
        if (profileRes.status === "fulfilled" && profileRes.value.data.success) {
          const u = profileRes.value.data.user;
          const saved = u.address?.shipping || {};
          setShippingAddress((prev) => ({
            ...prev,
            name: prev.name || u.name || "",
            email: prev.email || u.email || "",
            phone: prev.phone || saved.phone || u.phone || "",
            street: saved.street || "",
            city: saved.city || "",
            state: saved.state || "",
            pincode: saved.pincode || "",
            country: saved.country || "India",
          }));
        }
      } finally {
        setLoadingCart(false);
      }
    })();
  }, []);

  const updateShipping = (field: keyof Address, value: string) => {
    setShippingAddress((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  };
  const updateBilling = (field: keyof Address, value: string) => {
    setBillingAddress((prev) => ({ ...prev, [field]: value }));
    if (billingErrors[field]) setBillingErrors((e) => ({ ...e, [field]: undefined }));
  };

  const itemCount = useMemo(() => cartItems.reduce((n, i) => n + i.quantity, 0), [cartItems]);

  const goToSuccess = (orderId: string) => {
    window.dispatchEvent(new CustomEvent("cart:updated"));
    navigate("/order-success", { state: { orderId }, replace: true });
  };

  const persistAddress = () => {
    if (!saveAddress) return;
    const { street, city, state, country, pincode, phone } = shippingAddress;
    api.put("/profile", { address: { shipping: { street, city, state, country, pincode, phone } } }).catch(() => {});
  };

  const handlePlaceOrder = async () => {
    const shipErrors = validateAddress(shippingAddress);
    const billErrors = sameAsShipping ? {} : validateAddress(billingAddress);
    setErrors(shipErrors);
    setBillingErrors(billErrors);
    if (Object.keys(shipErrors).length || Object.keys(billErrors).length) {
      toast.error("Please complete the highlighted fields");
      document.getElementById("shipping-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    if (!cartItems.length) {
      toast.error("Your cart is empty");
      return;
    }

    setPlacing(true);
    try {
      if (paymentMethod === "razorpay" && !(await loadRazorpay())) {
        throw new Error("Payment gateway failed to load. Please check your connection or choose Cash on Delivery.");
      }

      const { data } = await api.post("/order/create", {
        shippingAddress,
        billingAddress: sameAsShipping ? shippingAddress : billingAddress,
        paymentMethod,
      });
      if (!data.success) throw new Error(data.message || "Failed to create order");
      persistAddress();

      if (paymentMethod === "cod") {
        toast.success("Order placed!");
        goToSuccess(data.order.orderId);
        return;
      }

      const rzp = new window.Razorpay({
        key: data.key_id || import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: data.razorpayOrder.amount,
        currency: data.razorpayOrder.currency,
        name: "FBB Store",
        description: `Order ${data.order.orderId}`,
        image: `${window.location.origin}/logo-512.png`,
        order_id: data.razorpayOrder.id,
        prefill: {
          name: shippingAddress.name,
          email: shippingAddress.email || undefined,
          contact: shippingAddress.phone,
        },
        notes: { orderId: data.order.orderId },
        theme: { color: "#1c1917" },
        handler: async (payment: any) => {
          const verifying = toast.loading("Confirming your payment…");
          try {
            const verify = await api.post("/payment/verify", {
              razorpay_order_id: payment.razorpay_order_id,
              razorpay_payment_id: payment.razorpay_payment_id,
              razorpay_signature: payment.razorpay_signature,
              orderId: data.order.orderId,
            });
            toast.dismiss(verifying);
            if (verify.data.success) {
              toast.success("Payment successful!");
              goToSuccess(data.order.orderId);
            } else {
              toast.error("We couldn't confirm the payment yet. If money was debited it will be confirmed automatically.");
              setPlacing(false);
            }
          } catch (err) {
            toast.dismiss(verifying);
            toast.error(
              errorMessage(err, "We couldn't confirm the payment yet. If money was debited it will be confirmed automatically.")
            );
            setPlacing(false);
          }
        },
        modal: {
          ondismiss: () => {
            setPlacing(false);
            toast("Payment cancelled. Your cart is still saved.", { icon: "🛒" });
          },
        },
      });
      rzp.on("payment.failed", (resp: any) => {
        toast.error(resp?.error?.description || "Payment failed. Please try again.");
        setPlacing(false);
      });
      rzp.open();
    } catch (err: any) {
      if (err?.response?.data?.requiresLogin) openAuthModal("login");
      toast.error(err?.response ? errorMessage(err, "Failed to place order") : err?.message || "Failed to place order");
      setPlacing(false);
    }
  };

  const placeLabel = paymentMethod === "cod" ? "Place order" : `Pay ${formatINR(summary.total)}`;

  return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      <NavBar />

      <main className="flex-grow pb-28 lg:pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
          <nav className="flex items-center text-sm text-stone-500 mb-6" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-stone-900 transition-colors">Home</Link>
            <ChevronRight className="h-4 w-4 mx-2" />
            <Link to="/cart" className="hover:text-stone-900 transition-colors">Cart</Link>
            <ChevronRight className="h-4 w-4 mx-2" />
            <span className="text-stone-900 font-medium">Checkout</span>
          </nav>

          <div className="flex items-end justify-between mb-8">
            <h1 className="font-serif text-3xl sm:text-4xl text-stone-900">Checkout</h1>
            <span className="hidden sm:inline-flex items-center gap-1.5 text-sm text-stone-500">
              <Lock className="h-4 w-4" /> Secure checkout
            </span>
          </div>

          {loadingCart ? (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              <div className="lg:col-span-3 space-y-6">
                <div className="skeleton h-96" />
                <div className="skeleton h-40" />
              </div>
              <div className="lg:col-span-2 skeleton h-96" />
            </div>
          ) : cartItems.length === 0 ? (
            <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center max-w-lg mx-auto">
              <ShoppingBag className="h-12 w-12 text-stone-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-stone-900 mb-2">Your cart is empty</h2>
              <p className="text-stone-500 mb-6">Add some products before checking out.</p>
              <Link to="/shop" className="inline-flex px-6 py-3 rounded-full bg-stone-900 text-white font-medium hover:bg-stone-800 transition">
                Continue shopping
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
              <div className="lg:col-span-3 space-y-6">
                <section id="shipping-section" className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-7 scroll-mt-28">
                  <h2 className="text-lg font-semibold text-stone-900 mb-5 flex items-center gap-2">
                    <span className="h-7 w-7 rounded-full bg-stone-900 text-white text-xs flex items-center justify-center">1</span>
                    <MapPin className="h-5 w-5 text-stone-500" /> Delivery address
                  </h2>
                  <AddressForm value={shippingAddress} errors={errors} onChange={updateShipping} idPrefix="ship" />
                  <div className="mt-5 space-y-3">
                    <label className="flex items-center gap-3 text-sm text-stone-700 cursor-pointer">
                      <input type="checkbox" checked={saveAddress} onChange={(e) => setSaveAddress(e.target.checked)} className="h-4 w-4 accent-amber-600" />
                      Save this address for next time
                    </label>
                    <label className="flex items-center gap-3 text-sm text-stone-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={sameAsShipping}
                        onChange={(e) => setSameAsShipping(e.target.checked)}
                        className="h-4 w-4 accent-amber-600"
                      />
                      Billing address is the same as delivery address
                    </label>
                  </div>
                </section>

                {!sameAsShipping && (
                  <section className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-7 animate-fade-in">
                    <h2 className="text-lg font-semibold text-stone-900 mb-5">Billing address</h2>
                    <AddressForm value={billingAddress} errors={billingErrors} onChange={updateBilling} idPrefix="bill" hideEmail />
                  </section>
                )}

                <section className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-7">
                  <h2 className="text-lg font-semibold text-stone-900 mb-5 flex items-center gap-2">
                    <span className="h-7 w-7 rounded-full bg-stone-900 text-white text-xs flex items-center justify-center">2</span>
                    <CreditCard className="h-5 w-5 text-stone-500" /> Payment method
                  </h2>
                  <div className="space-y-3" role="radiogroup" aria-label="Payment method">
                    {[
                      {
                        id: "razorpay" as const,
                        title: "Pay online",
                        desc: "UPI, cards, net banking & wallets via Razorpay",
                        icon: <CreditCard className="h-5 w-5" />,
                      },
                      {
                        id: "cod" as const,
                        title: "Cash on delivery",
                        desc: "Pay when your order arrives",
                        icon: <Truck className="h-5 w-5" />,
                      },
                    ].map((m) => (
                      <label
                        key={m.id}
                        className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition ${
                          paymentMethod === m.id ? "border-stone-900 bg-stone-50" : "border-stone-200 hover:border-stone-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={m.id}
                          checked={paymentMethod === m.id}
                          onChange={() => setPaymentMethod(m.id)}
                          className="h-4 w-4 accent-stone-900"
                        />
                        <span
                          className={`h-10 w-10 rounded-full flex items-center justify-center ${
                            paymentMethod === m.id ? "bg-stone-900 text-white" : "bg-stone-100 text-stone-600"
                          }`}
                        >
                          {m.icon}
                        </span>
                        <span className="flex-1">
                          <span className="block font-medium text-stone-900">{m.title}</span>
                          <span className="block text-sm text-stone-500">{m.desc}</span>
                        </span>
                      </label>
                    ))}
                  </div>
                </section>
              </div>

              <aside className="lg:col-span-2 lg:sticky lg:top-28">
                <div className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-7">
                  <h2 className="text-lg font-semibold text-stone-900 mb-5">
                    Order summary{" "}
                    <span className="text-stone-400 font-normal text-sm">
                      ({itemCount} {itemCount === 1 ? "item" : "items"})
                    </span>
                  </h2>
                  <ul className="divide-y divide-stone-100 max-h-80 overflow-y-auto -mx-1 px-1">
                    {cartItems.map((item) => (
                      <li key={item._id} className="flex gap-3 py-3">
                        <div className="relative h-16 w-16 flex-shrink-0 rounded-lg overflow-hidden bg-stone-100">
                          <img src={item.product.images?.image1} alt={item.product.name} className="h-full w-full object-cover" loading="lazy" />
                          <span className="absolute top-0 right-0 bg-stone-900 text-white text-[10px] font-semibold rounded-bl-lg px-1.5 py-0.5">
                            ×{item.quantity}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-stone-900 line-clamp-2">{item.product.name}</p>
                          <p className="text-xs text-stone-500 mt-0.5">
                            {[item.product.brand, item.selectedColor, item.selectedSize].filter(Boolean).join(" · ")}
                          </p>
                        </div>
                        <p className="text-sm font-semibold text-stone-900 whitespace-nowrap">{formatINR(item.price * item.quantity)}</p>
                      </li>
                    ))}
                  </ul>

                  <dl className="mt-5 pt-5 border-t border-stone-200 space-y-2.5 text-sm">
                    <div className="flex justify-between text-stone-600">
                      <dt>Subtotal</dt>
                      <dd>{formatINR(summary.subtotal)}</dd>
                    </div>
                    <div className="flex justify-between text-stone-600">
                      <dt>Shipping</dt>
                      <dd>{summary.shipping === 0 ? <span className="text-emerald-600 font-medium">Free</span> : formatINR(summary.shipping)}</dd>
                    </div>
                    <div className="flex justify-between text-stone-600">
                      <dt>GST (18%)</dt>
                      <dd>{formatINR(summary.tax)}</dd>
                    </div>
                    <div className="flex justify-between pt-3 border-t border-stone-200 text-base font-semibold text-stone-900">
                      <dt>Total</dt>
                      <dd>{formatINR(summary.total)}</dd>
                    </div>
                  </dl>

                  <button
                    onClick={handlePlaceOrder}
                    disabled={placing}
                    className="hidden lg:flex w-full mt-6 py-3.5 rounded-xl bg-stone-900 text-white font-semibold items-center justify-center gap-2 hover:bg-stone-800 transition disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {placing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
                    {placing ? "Processing…" : placeLabel}
                  </button>

                  <ul className="mt-6 grid grid-cols-3 gap-2 text-center text-[11px] text-stone-500">
                    <li className="flex flex-col items-center gap-1"><Shield className="h-5 w-5 text-stone-400" />Secure payment</li>
                    <li className="flex flex-col items-center gap-1"><BadgeCheck className="h-5 w-5 text-stone-400" />Verified sellers</li>
                    <li className="flex flex-col items-center gap-1"><RotateCcw className="h-5 w-5 text-stone-400" />30-day returns</li>
                  </ul>
                </div>
              </aside>
            </div>
          )}
        </div>
      </main>

      {!loadingCart && cartItems.length > 0 && (
        <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-stone-200 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-[0_-8px_24px_-12px_rgba(0,0,0,0.15)]">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              <p className="text-xs text-stone-500">Total</p>
              <p className="text-lg font-semibold text-stone-900">{formatINR(summary.total)}</p>
            </div>
            <button
              onClick={handlePlaceOrder}
              disabled={placing}
              className="flex-1 py-3.5 rounded-xl bg-stone-900 text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {placing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
              {placing ? "Processing…" : paymentMethod === "cod" ? "Place order" : "Pay now"}
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default CheckoutPage;
