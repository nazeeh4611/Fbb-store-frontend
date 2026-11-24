import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Clock, Mail, MapPin, MessageCircle, Package, Phone, RotateCcw, Store } from "lucide-react";
import { toast } from "react-hot-toast";
import NavBar from "./Navbar";
import Footer from "./Footer";
import { Breadcrumbs, Container, btn } from "../Store/Sections";

const CONTACT = {
  phone: "+91 98330 23277",
  whatsapp: "919833023277",
  email: "flybuybrand26@gmail.com",
  hours: "Mon–Sat, 9:00 AM – 8:00 PM",
  address: "Bilathikulam Road, Nadakavu, Kozhikode 673011, Kerala",
};

const TOPICS = ["Order & delivery", "Returns & refunds", "Payments", "Selling on FBB", "Something else"];

const QUICK = [
  { icon: Package, title: "Track an order", text: "See status and delivery updates", to: "/orders" },
  { icon: RotateCcw, title: "Start a return", text: "Open the order and choose return", to: "/orders" },
  { icon: Store, title: "Become a seller", text: "Apply to sell on FBB Store", to: "/seller/register" },
];

const ContactPage = () => {
  const [form, setForm] = useState({ name: "", phone: "", topic: TOPICS[0], orderId: "", message: "" });
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  useEffect(() => {
    document.title = "Contact us · FBB Store";
  }, []);

  const body = () =>
    [
      `Hi FBB Store,`,
      ``,
      `Topic: ${form.topic}`,
      form.orderId && `Order ID: ${form.orderId}`,
      ``,
      form.message.trim(),
      ``,
      `— ${form.name.trim()}${form.phone ? ` (${form.phone})` : ""}`,
    ]
      .filter((l): l is string => typeof l === "string")
      .join("\n");

  const valid = () => {
    if (!form.name.trim() || form.message.trim().length < 10) {
      toast.error("Please add your name and a short message");
      return false;
    }
    return true;
  };

  const sendWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid()) return;
    window.open(`https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(body())}`, "_blank", "noopener");
  };

  const sendEmail = () => {
    if (!valid()) return;
    window.location.href = `mailto:${CONTACT.email}?subject=${encodeURIComponent(`[FBB] ${form.topic}${form.orderId ? ` – ${form.orderId}` : ""}`)}&body=${encodeURIComponent(body())}`;
  };

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <NavBar />
      <main className="flex-1">
        <section className="border-b border-line bg-canvas">
          <Container className="py-10 sm:py-14">
            <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Contact us" }]} />
            <h1 className="mt-3 font-display text-4xl font-semibold uppercase sm:text-5xl">How can we help?</h1>
            <p className="mt-2 max-w-xl text-[15px] text-ink-soft">Our team replies within one business day. For the fastest answer, message us on WhatsApp.</p>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {QUICK.map(({ icon: Icon, title, text, to }) => (
                <Link key={title} to={to} className="flex items-center gap-4 rounded-md bg-white p-5 transition hover:shadow-md">
                  <Icon className="h-6 w-6 shrink-0" strokeWidth={1.5} />
                  <span>
                    <span className="block font-semibold">{title}</span>
                    <span className="block text-sm text-muted">{text}</span>
                  </span>
                </Link>
              ))}
            </div>
          </Container>
        </section>

        <Container className="grid gap-12 py-12 sm:py-16 lg:grid-cols-12">
          <form onSubmit={sendWhatsApp} className="lg:col-span-7" noValidate>
            <h2 className="font-display text-2xl font-semibold uppercase">Send us a message</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium">Your name *</span>
                <input value={form.name} onChange={set("name")} autoComplete="name" className="field" required />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium">Phone</span>
                <input value={form.phone} onChange={set("phone")} type="tel" autoComplete="tel" className="field" />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium">Topic</span>
                <select value={form.topic} onChange={set("topic")} className="field">
                  {TOPICS.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium">Order ID (if any)</span>
                <input value={form.orderId} onChange={set("orderId")} placeholder="e.g. ORD-12345" className="field" />
              </label>
              <label className="block sm:col-span-2">
                <span className="mb-1.5 block text-sm font-medium">Message *</span>
                <textarea value={form.message} onChange={set("message")} rows={6} className="field resize-y" required />
              </label>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <button type="submit" className={btn.primary}>
                <MessageCircle className="h-4 w-4" /> Send on WhatsApp
              </button>
              <button type="button" onClick={sendEmail} className={btn.secondary}>
                <Mail className="h-4 w-4" /> Send by email
              </button>
            </div>
            <p className="mt-3 text-xs text-muted">Your message opens in WhatsApp or your email app, ready to send.</p>
          </form>

          <aside className="space-y-4 lg:col-span-5">
            {[
              { icon: Phone, title: "Call us", value: CONTACT.phone, href: `tel:${CONTACT.phone.replace(/\s/g, "")}` },
              { icon: Mail, title: "Email", value: CONTACT.email, href: `mailto:${CONTACT.email}` },
              { icon: Clock, title: "Opening hours", value: CONTACT.hours },
              { icon: MapPin, title: "Address", value: CONTACT.address },
            ].map(({ icon: Icon, title, value, href }) => {
              const inner = (
                <>
                  <Icon className="mt-0.5 h-5 w-5 shrink-0" strokeWidth={1.5} />
                  <span>
                    <span className="block text-sm font-semibold">{title}</span>
                    <span className="block text-sm text-muted">{value}</span>
                  </span>
                </>
              );
              return href ? (
                <a key={title} href={href} className="flex items-start gap-4 rounded-md border border-line p-5 hover:border-ink">
                  {inner}
                </a>
              ) : (
                <div key={title} className="flex items-start gap-4 rounded-md border border-line p-5">
                  {inner}
                </div>
              );
            })}
          </aside>
        </Container>
      </main>
      <Footer />
    </div>
  );
};

export default ContactPage;
