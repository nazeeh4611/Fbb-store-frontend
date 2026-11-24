import { useEffect } from "react";
import { Link } from "react-router-dom";
import { BadgeCheck, Instagram, Mail, MapPin, Phone, RotateCcw, ShieldCheck, Truck } from "lucide-react";
import NavBar from "./Navbar";
import Footer from "./Footer";
import Hero2 from "./Img/Hero2.jpg";
import { Breadcrumbs, Container, btn } from "../Store/Sections";

const VALUES = [
  { icon: BadgeCheck, title: "Verified sellers", text: "Every store is reviewed and approved by our team before it can sell on FBB." },
  { icon: ShieldCheck, title: "Secure payments", text: "Online payments run through Razorpay, and cash on delivery is always an option." },
  { icon: Truck, title: "Delivered to your door", text: "Orders are packed by the seller and tracked from dispatch to delivery." },
  { icon: RotateCcw, title: "Easy returns", text: "Something not right? Request a return straight from your order page." },
];

const AboutPage = () => {
  useEffect(() => {
    document.title = "About us · FBB Store";
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <NavBar />
      <main className="flex-1">
        <section className="relative h-[52vh] min-h-[360px] overflow-hidden bg-ink">
          <img src={Hero2} alt="" className="absolute inset-0 h-full w-full object-cover opacity-70" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/30 to-transparent" />
          <Container className="relative flex h-full items-end pb-12 text-white sm:items-center sm:pb-0">
            <div className="max-w-xl">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/80">About FBB Store</p>
              <h1 className="mt-3 font-display text-5xl font-semibold uppercase leading-[0.95] sm:text-6xl">Fly. Buy. Brand.</h1>
              <p className="mt-4 text-base text-white/85">
                A marketplace for fashion and lifestyle from independent sellers and trusted brands — curated, verified and delivered across India.
              </p>
            </div>
          </Container>
        </section>

        <Container className="py-10 sm:py-16">
          <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "About us" }]} />
          <div className="mt-8 grid gap-10 md:grid-cols-2 md:gap-16">
            <div>
              <h2 className="font-display text-3xl font-semibold uppercase">Our story</h2>
              <div className="mt-5 space-y-4 text-[15px] leading-relaxed text-ink-soft">
                <p>
                  FBB Store was founded by Murshid Ul Haq with a simple idea: make quality fashion and lifestyle products easy to discover and safe to buy, while
                  giving independent sellers a professional place to reach new customers.
                </p>
                <p>
                  Every seller on FBB is approved by our team, and every order is protected by secure checkout. We work closely with our sellers on product
                  quality, honest pricing and dependable delivery.
                </p>
                <p>We're building more than a shop — a community around quality, authenticity and great service.</p>
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/shop" className={btn.primary}>Start shopping</Link>
                <Link to="/seller/register" className={btn.secondary}>Sell on FBB</Link>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {VALUES.map(({ icon: Icon, title, text }) => (
                <div key={title} className="rounded-md bg-canvas p-6">
                  <Icon className="h-7 w-7" strokeWidth={1.5} />
                  <h3 className="mt-4 font-semibold">{title}</h3>
                  <p className="mt-1 text-sm text-muted">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </Container>

        <section className="bg-canvas">
          <Container className="grid items-center gap-10 py-12 sm:py-16 md:grid-cols-12">
            <div className="md:col-span-4">
              <div className="mx-auto aspect-[4/5] max-w-xs overflow-hidden rounded-md bg-line md:max-w-none">
                <img src="/murshid.avif" alt="Murshid Ul Haq, founder of FBB Store" className="h-full w-full object-cover" loading="lazy" />
              </div>
            </div>
            <div className="md:col-span-8">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Founder & CEO</p>
              <h2 className="mt-2 font-display text-3xl font-semibold uppercase">Murshid Ul Haq</h2>
              <blockquote className="mt-5 max-w-2xl font-display text-xl leading-snug sm:text-2xl">
                “Our mission is to create more than a shopping experience. Every product tells a story, and we're here to share those stories with you.”
              </blockquote>
              <a
                href="https://instagram.com/murshid__nooras"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold underline-offset-4 hover:underline"
              >
                <Instagram className="h-4 w-4" /> @murshid__nooras
              </a>
            </div>
          </Container>
        </section>

        <Container className="py-12 sm:py-16">
          <h2 className="font-display text-3xl font-semibold uppercase">Get in touch</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <a href="mailto:flybuybrand26@gmail.com" className="flex items-start gap-3 rounded-md border border-line p-5 hover:border-ink">
              <Mail className="mt-0.5 h-5 w-5 shrink-0" />
              <span><span className="block font-semibold">Email</span><span className="text-sm text-muted">flybuybrand26@gmail.com</span></span>
            </a>
            <a href="tel:+919833023277" className="flex items-start gap-3 rounded-md border border-line p-5 hover:border-ink">
              <Phone className="mt-0.5 h-5 w-5 shrink-0" />
              <span><span className="block font-semibold">Phone</span><span className="text-sm text-muted">+91 98330 23277 · Mon–Sat, 9am–8pm</span></span>
            </a>
            <div className="flex items-start gap-3 rounded-md border border-line p-5">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0" />
              <span><span className="block font-semibold">Visit</span><span className="text-sm text-muted">Nooras Tower, near Supplyco, Chettipadi, Malappuram, Kerala 676319</span></span>
            </div>
          </div>
          <Link to="/contact" className="mt-6 inline-block text-sm font-semibold underline underline-offset-4">Send us a message</Link>
        </Container>
      </main>
      <Footer />
    </div>
  );
};

export default AboutPage;
