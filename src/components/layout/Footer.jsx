import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-foreground text-background/80 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <h3 className="font-heading text-xl font-bold text-background mb-3">DeshiBazar</h3>
            <p className="text-sm leading-relaxed opacity-70">
              Your one-stop destination for trendy and affordable fashion in Bangladesh. Quality clothing delivered to your doorstep.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading font-semibold text-background mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/products" className="hover:text-background transition-colors">All Products</Link></li>
              <li><Link to="/products?category=mens" className="hover:text-background transition-colors">Men's Fashion</Link></li>
              <li><Link to="/products?category=womens" className="hover:text-background transition-colors">Women's Fashion</Link></li>
              <li><Link to="/orders" className="hover:text-background transition-colors">Track Order</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="font-heading font-semibold text-background mb-3">Customer Service</h4>
            <ul className="space-y-2 text-sm">
              <li>Return & Exchange Policy</li>
              <li>Shipping Information</li>
              <li>Privacy Policy</li>
              <li>Terms & Conditions</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-heading font-semibold text-background mb-3">Contact Us</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0" />
                +880 1234-567890
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0" />
                support@deshibazar.com
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                Dhaka, Bangladesh
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-background/10 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs opacity-60">© 2026 DeshiBazar. All rights reserved.</p>
          <div className="flex items-center gap-4 text-xs opacity-60">
            <span>bKash</span>
            <span>Nagad</span>
            <span>Visa</span>
            <span>Mastercard</span>
            <span>COD</span>
          </div>
        </div>
      </div>
    </footer>
  );
}