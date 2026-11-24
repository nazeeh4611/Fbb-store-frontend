import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, CreditCard, Instagram, Mail, Phone, RotateCcw, ShieldCheck, Truck } from "lucide-react";
import fbb from "./Img/fbb.png";
import { sortForMenu, useCategoryTree } from "../../lib/shop";
import { cn } from "../../lib/util";

const PERKS = [
  { icon: Truck, title: "Fast delivery", text: "Free shipping on selected styles" },
  { icon: RotateCcw, title: "Easy returns", text: "Request a return from your orders" },
  { icon: ShieldCheck, title: "Secure checkout", text: "Payments protected by Razorpay" },
  { icon: CreditCard, title: "Cash on delivery", text: "Pay when your order arrives" },
];

const Column: React.FC<{ title: string; links: { label: string; to: string }[] }> = ({ title, links }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/10 md:border-0">
      <button
        className="flex w-full items-center justify-between py-4 text-left md:pointer-events-none md:py-0"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-white">{title}</h3>
        <ChevronDown className={cn("h-4 w-4 text-white/60 transition md:hidden", open && "rotate-180")} />
      </button>
      <ul className={cn("space-y-3 pb-5 md:mt-5 md:block md:pb-0", open ? "block" : "hidden")}>
        {links.map((l) => (
          <li key={l.label}>
            <Link to={l.to} className="text-sm text-white/65 transition hover:text-white">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

const Footer: React.FC = () => {
  const { categories } = useCategoryTree();
  const shopLinks = [
    { label: "New in", to: "/shop?sort=new" },
    ...sortForMenu(categories)
      .slice(0, 5)
      .map((c) => ({ label: c.name, to: `/shop/category/${c._id}` })),
    { label: "Sale", to: "/shop?sale=1" },
  ];

  return (
    <footer className="mt-auto">
      <div className="border-t border-line bg-canvas">
        <div className="mx-auto grid max-w-[1440px] grid-cols-2 gap-6 px-4 py-8 sm:px-6 lg:grid-cols-4 lg:px-10">
          {PERKS.map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex items-start gap-3">
              <Icon className="mt-0.5 h-6 w-6 shrink-0" strokeWidth={1.5} />
              <div>
                <p className="text-sm font-semibold">{title}</p>
                <p className="text-xs text-muted sm:text-sm">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-ink text-white">
        <div className="mx-auto max-w-[1440px] px-4 pt-12 sm:px-6 lg:px-10">
          <div className="grid gap-8 md:grid-cols-12 md:gap-10">
            <div className="md:col-span-4">
              <img src={fbb} alt="FBB Fly Buy Brand" className="h-12 w-auto" loading="lazy" />
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/65">
                Fashion, accessories and lifestyle from verified sellers, delivered across India with secure checkout.
              </p>
              <div className="mt-6 space-y-2.5 text-sm">
                <a href="mailto:flybuybrand26@gmail.com" className="flex items-center gap-3 text-white/80 hover:text-white">
                  <Mail className="h-4 w-4" /> flybuybrand26@gmail.com
                </a>
                <a href="tel:+919833023277" className="flex items-center gap-3 text-white/80 hover:text-white">
                  <Phone className="h-4 w-4" /> +91 98330 23277
                </a>
              </div>
              <a
                href="https://www.instagram.com/fbb_store_"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="FBB Store on Instagram"
                className="mt-6 inline-grid h-10 w-10 place-items-center rounded-full border border-white/20 hover:bg-white hover:text-ink"
              >
                <Instagram className="h-[18px] w-[18px]" />
              </a>
            </div>

            <div className="grid md:col-span-8 md:grid-cols-3 md:gap-8">
              <Column title="Shop" links={shopLinks} />
              <Column
                title="Customer care"
                links={[
                  { label: "My account", to: "/profile" },
                  { label: "Track my order", to: "/orders" },
                  { label: "Contact us", to: "/contact" },
                  { label: "Bag", to: "/cart" },
                ]}
              />
              <Column
                title="FBB Store"
                links={[
                  { label: "About us", to: "/about" },
                  { label: "Brands & sellers", to: "/seller-list" },
                  { label: "Sell on FBB", to: "/seller/register" },
                  { label: "Seller login", to: "/seller/login" },
                ]}
              />
            </div>
          </div>

          <div className="mt-12 flex flex-col gap-3 border-t border-white/10 py-6 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} FBB Store · Fly Buy Brand. All rights reserved.</p>
            <p>Nooras Tower, Chettipadi, Malappuram, Kerala 676319</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
