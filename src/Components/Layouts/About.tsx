import { MapPin, Phone, Mail, Clock, Instagram } from 'lucide-react';
import Footer from './Footer';
import NavBar from './Navbar';
import Murshid from "../Layouts/Img/Murshid.png";
 

interface ContactInfo {
  address: string;
  phone: string;
  email: string;
  hours: string;
}

interface CEOInfo {
  name: string;
  title: string;
  instagram: string;
  bio: string;
}

const AboutPage = () => {
  const contactInfo: ContactInfo = {
    address: "Nooras Tower, near Supplyco, Chettipadi, Kerala 676319",
    phone: "+91 90612 56500",
    email: "fbbstore1@gmail.com",
    hours: "Mon-Sat: 9:00 AM - 8:00 PM"
  };

  const ceoInfo: CEOInfo = {
    name: "Murshid Ul Haq" ,
    title: "Founder & CEO",
    instagram: "@murshid__nooras",
    bio: "With over 5 years of experience in the retail industry, Murshid founded FBB Store with a passion for making quality fashion accessible to everyone."
  };

  return (
    <>
    <NavBar/>
    <div className="min-h-screen bg-gray-50 mt-16">
      {/* Hero Section */}
      <div className="relative bg-black text-white py-20">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Welcome to FBB Store</h1>
          <p className="text-xl md:text-2xl max-w-2xl">Your one-stop destination for fashion, beauty, and home essentials.</p>
        </div>
      </div>

      {/* About Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-8">About Us</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <p className="text-gray-600">
                Founded with a vision to provide quality products at competitive prices, FBB Store has grown to become
                a leading e-commerce destination for fashion-conscious individuals and families.
              </p>
              <p className="text-gray-600">
                We offer a carefully curated selection of clothing, beauty accessories, watches, sunglasses, and home
                appliances for men, women, and children.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">What Sets Us Apart</h3>
              <div className="space-y-2">
                <p className="text-gray-600">✓ Premium Quality Products</p>
                <p className="text-gray-600">✓ Competitive Pricing</p>
                <p className="text-gray-600">✓ Express Delivery</p>
                <p className="text-gray-600">✓ 24/7 Customer Support</p>
                <p className="text-gray-600">✓ Easy Returns & Exchanges</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CEO Section */}
      <div className="bg-gray-100 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8">Meet Our Founder</h2>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
                <div className="w-40 h-40 rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden">
                  <img src={Murshid} alt="Murshid Ul Haq" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-2xl font-bold">{ceoInfo.name}</h3>
                  <p className="text-blue-600 font-medium mb-2">{ceoInfo.title}</p>
                  <p className="text-gray-600 mb-4">{ceoInfo.bio}</p>
                  <a href={`https://instagram.com/${ceoInfo.instagram.replace('@', '')}`} 
                     className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors">
                    <Instagram className="w-5 h-5 mr-2" />
                    <span>{ceoInfo.instagram}</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8">Contact Us</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <MapPin className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                  <p className="text-gray-600">{contactInfo.address}</p>
                </div>
                <div className="flex items-center space-x-4">
                  <Phone className="w-6 h-6 text-blue-600" />
                  <p className="text-gray-600">{contactInfo.phone}</p>
                </div>
                <div className="flex items-center space-x-4">
                  <Mail className="w-6 h-6 text-blue-600" />
                  <p className="text-gray-600">{contactInfo.email}</p>
                </div>
                <div className="flex items-center space-x-4">
                  <Clock className="w-6 h-6 text-blue-600" />
                  <p className="text-gray-600">{contactInfo.hours}</p>
                </div>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
                <form className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input type="text" className="w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input type="email" className="w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                    <textarea rows={4} className="w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"></textarea>
                  </div>
                  <button type="submit" className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">
                    Send Message
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Terms & Conditions */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-8">Terms & Conditions</h2>
          <div className="prose max-w-none">
            <div className="space-y-6 text-gray-600">
              <section>
                <h3 className="text-xl font-semibold mb-4">1. General Terms</h3>
                <p>
                  By accessing and placing an order with FBB Store, you confirm that you are in agreement with and bound by
                  these terms and conditions contained herein.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-4">2. Product Information</h3>
                <p>
                  We strive to display accurate product information, including prices and availability. However, we reserve
                  the right to correct any errors and modify prices without prior notice.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-4">3. Shipping & Delivery</h3>
                <p>
                  Delivery times may vary depending on your location and product availability. Standard shipping typically
                  takes 3-5 business days. Express shipping options are available at checkout.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-4">4. Returns & Refunds</h3>
                <p>
                  We accept returns within 30 days of purchase. Items must be unused and in their original packaging.
                  Refunds will be processed within 7-10 business days of receiving the returned item.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-4">5. Privacy & Security</h3>
                <p>
                  We are committed to protecting your privacy and securing your personal information. Please review our
                  Privacy Policy for detailed information about how we collect and use your data.
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
    <Footer/>
    </>
  );
};

export default AboutPage;