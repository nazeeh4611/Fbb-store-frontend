import { Link } from "react-router-dom"
import {
  Instagram,
  Facebook,
  Twitter,
  Youtube,
  Mail,
  Phone,
  MapPin,
  Truck,
  Headphones,
  Shield,
  CreditCard,
  Gift,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { useState } from "react"

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [openSection, setOpenSection] = useState<string | null>(null);

  const toggle = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  const shopCategories = [
    { name: "Men's Fashion", href: "/shop" },
    { name: "Women's Fashion", href: "/shop" },
    { name: "Accessories", href: "/shop" },
    { name: "Footwear", href: "/shop" },
    { name: "Watches", href: "/shop" },
    { name: "Sunglasses", href: "/shop" },
    { name: "Bags & Luggage", href: "/shop" },
    { name: "Jewelry", href: "/shop" }
  ];

  const companyLinks = [
    { name: "About Us", href: "/about" },
    { name: "Our Story", href: "/about" },
  ];

  const customerService = [
    { name: "Contact Us", href: "/contact" },
  ];

  const features = [
    { icon: <Truck className="w-5 h-5" />, title: "Free Shipping", description: "Orders over $500" },
    { icon: <Shield className="w-5 h-5" />, title: "Authentic", description: "100% genuine" },
    { icon: <CreditCard className="w-5 h-5" />, title: "Secure Pay", description: "SSL encrypted" },
    { icon: <Headphones className="w-5 h-5" />, title: "24/7 Support", description: "Always here" },
    { icon: <Gift className="w-5 h-5" />, title: "Gift Wrap", description: "Premium pack" }
  ];

  const AccordionSection = ({ id, title, children }: { id: string; title: string; children: React.ReactNode }) => (
    <div className="border-b border-gray-800">
      <button
        className="w-full flex items-center justify-between py-3.5 text-left"
        onClick={() => toggle(id)}
      >
        <span className="text-sm font-bold tracking-wider text-white">{title}</span>
        {openSection === id
          ? <ChevronUp className="w-4 h-4 text-gold-400 flex-shrink-0" />
          : <ChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0" />}
      </button>
      {openSection === id && (
        <div className="pb-3 space-y-2.5">
          {children}
        </div>
      )}
    </div>
  );

  return (
    <footer className="bg-black text-white">
      {/* Features - horizontal scroll on mobile, grid on desktop */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 md:py-8">
          <div className="flex md:grid md:grid-cols-5 gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory -mx-4 md:mx-0 px-4 md:px-0">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex-shrink-0 w-32 md:w-auto snap-start flex flex-col items-center text-center p-3 md:p-0 bg-gray-900 md:bg-transparent rounded-xl md:rounded-none"
              >
                <div className="text-gold-400 mb-2">{feature.icon}</div>
                <h3 className="font-semibold text-xs md:text-sm mb-0.5">{feature.title}</h3>
                <p className="text-gray-400 text-xs">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-12">

        {/* Desktop Grid */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          <div className="space-y-5">
            <div className="text-2xl font-bold tracking-wider">FBB LUXURY</div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Redefining luxury fashion since 2010. We curate the finest collections from world-renowned designers.
            </p>
            <div className="space-y-2.5">
              <div className="flex items-start space-x-3">
                <MapPin className="w-4 h-4 text-gold-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-300">Calicut Road, Malappuram, Kerala 676552</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-gold-400 flex-shrink-0" />
                <span className="text-sm text-gray-300">fbbstore1@gmail.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-gold-400 flex-shrink-0" />
                <span className="text-sm text-gray-300">+91 7012551507</span>
              </div>
            </div>
            <div className="flex space-x-4">
              <a href="https://www.instagram.com/fbb_store_?igsh=NWU0c2RpbW95a3Ro" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gold-400 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-gold-400 transition-colors"><Facebook className="w-5 h-5" /></a>
              <a href="#" className="text-gray-400 hover:text-gold-400 transition-colors"><Twitter className="w-5 h-5" /></a>
              <a href="#" className="text-gray-400 hover:text-gold-400 transition-colors"><Youtube className="w-5 h-5" /></a>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold mb-5 pb-2.5 border-b border-gray-800 tracking-wider">SHOP</h3>
            <ul className="space-y-2.5">
              {shopCategories.map((c) => (
                <li key={c.name}>
                  <Link to={c.href} className="text-gray-400 hover:text-gold-400 transition-colors text-sm flex items-center group">
                    <span className="w-1 h-1 bg-gold-400 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold mb-5 pb-2.5 border-b border-gray-800 tracking-wider">COMPANY</h3>
            <ul className="space-y-2.5">
              {companyLinks.map((l) => (
                <li key={l.name}>
                  <Link to={l.href} className="text-gray-400 hover:text-gold-400 transition-colors text-sm flex items-center group">
                    <span className="w-1 h-1 bg-gold-400 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {l.name}
                  </Link>
                </li>
              ))}
            </ul>
            <h3 className="text-sm font-bold mt-6 mb-4 pb-2.5 border-b border-gray-800 tracking-wider">SUPPORT</h3>
            <ul className="space-y-2.5">
              {customerService.map((s) => (
                <li key={s.name}>
                  <Link to={s.href} className="text-gray-400 hover:text-gold-400 transition-colors text-sm flex items-center group">
                    <span className="w-1 h-1 bg-gold-400 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {s.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold mb-5 pb-2.5 border-b border-gray-800 tracking-wider">NEWSLETTER</h3>
            <p className="text-gray-400 text-sm mb-4">Be first to discover new collections and exclusive offers.</p>
            <div className="flex flex-col gap-2">
              <input
                type="email"
                placeholder="Your email address"
                className="px-3 py-2.5 bg-gray-900 border border-gray-800 rounded text-white placeholder-gray-500 text-sm focus:outline-none focus:border-gold-400 transition-colors"
              />
              <button className="px-4 py-2.5 bg-gold-400 text-black font-semibold rounded text-sm hover:bg-gold-500 transition-colors">
                SUBSCRIBE
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden">
          {/* Brand compact */}
          <div className="flex items-center justify-between mb-5 pb-4 border-b border-gray-800">
            <div>
              <div className="text-xl font-bold tracking-wider mb-1">FBB LUXURY</div>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Mail className="w-3 h-3 text-gold-400" />
                <span>fbbstore1@gmail.com</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                <Phone className="w-3 h-3 text-gold-400" />
                <span>+91 7012551507</span>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <a href="https://www.instagram.com/fbb_store_?igsh=NWU0c2RpbW95a3Ro" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gold-400 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-gold-400 transition-colors"><Facebook className="w-5 h-5" /></a>
              <a href="#" className="text-gray-400 hover:text-gold-400 transition-colors"><Youtube className="w-5 h-5" /></a>
            </div>
          </div>

          {/* Accordion sections */}
          <AccordionSection id="shop" title="SHOP">
            {shopCategories.map((c) => (
              <Link key={c.name} to={c.href} className="block text-gray-400 text-sm py-0.5 hover:text-gold-400 transition-colors">
                {c.name}
              </Link>
            ))}
          </AccordionSection>

          <AccordionSection id="company" title="COMPANY">
            {companyLinks.map((l) => (
              <Link key={l.name} to={l.href} className="block text-gray-400 text-sm py-0.5 hover:text-gold-400 transition-colors">
                {l.name}
              </Link>
            ))}
          </AccordionSection>

          <AccordionSection id="support" title="SUPPORT">
            {customerService.map((s) => (
              <Link key={s.name} to={s.href} className="block text-gray-400 text-sm py-0.5 hover:text-gold-400 transition-colors">
                {s.name}
              </Link>
            ))}
          </AccordionSection>

          {/* Newsletter compact */}
          <div className="mt-5 pt-5 border-t border-gray-800">
            <p className="text-sm font-bold tracking-wider mb-3">JOIN OUR COMMUNITY</p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Your email"
                className="flex-grow px-3 py-2.5 bg-gray-900 border border-gray-800 rounded text-white placeholder-gray-500 text-sm focus:outline-none focus:border-gold-400 transition-colors"
              />
              <button className="px-4 py-2.5 bg-gold-400 text-black font-bold rounded text-xs hover:bg-gold-500 transition-colors whitespace-nowrap">
                JOIN
              </button>
            </div>
          </div>

          {/* Address mobile */}
          <div className="mt-4 pt-4 border-t border-gray-800 flex items-start gap-2 text-xs text-gray-400">
            <MapPin className="w-3.5 h-3.5 text-gold-400 mt-0.5 flex-shrink-0" />
            <span>Calicut Road, Malappuram, Kerala 676552</span>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-5">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
            <p className="text-gray-500 text-xs text-center sm:text-left">
              © {currentYear} FBB Store. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-1.5">
                <span>Country:</span>
                <select className="bg-transparent border-none focus:outline-none text-white text-xs">
                  <option>United States</option>
                  <option>United Kingdom</option>
                  <option>United Arab Emirates</option>
                  <option>India</option>
                  <option>Singapore</option>
                </select>
              </div>
            </div>
          </div>
          <p className="text-gray-600 text-xs text-center mt-3 hidden md:block">
            FBB Store is a registered trademark. All products are authentic and sourced directly from authorized distributors.
          </p>
        </div>
      </div>

      <style>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </footer>
  );
}