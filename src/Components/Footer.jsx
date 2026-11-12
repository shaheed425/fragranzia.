import { Link } from "react-router-dom";
import "../Styles/Footer.css";
import { CiInstagram, CiFacebook, CiTwitter } from "react-icons/ci";
import { Mail, Phone } from "lucide-react";

function Footer() {
  return (
    <footer className="Footer border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-7 space-y-5">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 items-stretch">
          {/* Brand Box */}
          <div className="col-span-2 lg:col-span-1 bg-white/[0.04] border border-white/10 rounded-xl p-4 flex flex-col justify-between gap-3">
            <div>
              <Link to="/" className="text-lg font-bold tracking-tight text-white">
                Fragranzia
              </Link>
              <p className="mt-1.5 text-xs text-slate-300 leading-relaxed">
                Curated luxury fragrances crafted for everyday elegance.
              </p>
            </div>
            <div className="flex items-center gap-2.5 text-slate-300">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="p-1.5 rounded-lg bg-white/5 border border-white/10 hover:text-white hover:bg-white/10 transition-colors"
              >
                <CiInstagram size={18} />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="p-1.5 rounded-lg bg-white/5 border border-white/10 hover:text-white hover:bg-white/10 transition-colors"
              >
                <CiFacebook size={18} />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Twitter"
                className="p-1.5 rounded-lg bg-white/5 border border-white/10 hover:text-white hover:bg-white/10 transition-colors"
              >
                <CiTwitter size={18} />
              </a>
            </div>
          </div>

          {/* Shop Box */}
          <div className="col-span-1 bg-white/[0.04] border border-white/10 rounded-xl p-4 flex flex-col gap-2 text-xs">
            <h2 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Shop
            </h2>
            <Link to="/" className="text-slate-200 hover:text-white transition-colors">
              Home
            </Link>
            <Link to="/product" className="text-slate-200 hover:text-white transition-colors">
              All Perfumes
            </Link>
            <Link to="/wishlist" className="text-slate-200 hover:text-white transition-colors">
              Wishlist
            </Link>
            <Link to="/cart" className="text-slate-200 hover:text-white transition-colors">
              Cart
            </Link>
          </div>

          {/* Account Box */}
          <div className="col-span-1 bg-white/[0.04] border border-white/10 rounded-xl p-4 flex flex-col gap-2 text-xs">
            <h2 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Account
            </h2>
            <Link to="/profile" className="text-slate-200 hover:text-white transition-colors">
              My Profile
            </Link>
            <Link to="/orderdetails" className="text-slate-200 hover:text-white transition-colors">
              My Orders
            </Link>
            <Link to="/checkout" className="text-slate-200 hover:text-white transition-colors">
              Checkout
            </Link>
          </div>

          {/* Contact Box */}
          <div className="col-span-2 lg:col-span-1 bg-white/[0.04] border border-white/10 rounded-xl p-4 flex flex-col justify-between gap-2.5 text-xs">
            <div className="space-y-2">
              <h2 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Help & Contact
              </h2>
              <a
                href="mailto:support@fragranzia.com"
                className="flex items-center gap-2 text-slate-200 hover:text-white transition-colors break-all"
              >
                <Mail size={13} className="shrink-0 text-slate-400" />
                <span>support@fragranzia.com</span>
              </a>
              <a
                href="tel:+919400653289"
                className="flex items-center gap-2 text-slate-200 hover:text-white transition-colors"
              >
                <Phone size={13} className="shrink-0 text-slate-400" />
                <span>+91 9400653289</span>
              </a>
            </div>
            <p className="text-[11px] text-slate-400">
              100% Authentic • Express Delivery
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400 text-center sm:text-left">
          <p>© 2026 Fragranzia. All rights reserved.</p>
          <p>Secure Razorpay Payments</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
