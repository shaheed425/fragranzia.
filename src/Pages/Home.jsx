import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Truck, ShieldCheck, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import NavBar from "../Components/NavBar";
import Footer from "../Components/Footer";
import heroMist from "../assets/c1.jpeg";
import heroSpray from "../assets/hero-spray.jpg";
import heroFloral from "../assets/hero-floral.webp";
import "../Styles/Home.css";
import { Cartcontext, Categorycontext, Maincontext, NavbarContext } from "../Contexts/contexts";
import { getDiscountPercent, getEffectivePrice, getProductImageUrl, handleImageError } from "../Axios";

const ProductCard = ({ item, onAddCart }) => {
  const effectivePrice = getEffectivePrice(item);
  const discount = getDiscountPercent(item);
  const outOfStock = (item.stock ?? 0) < 1;

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-3 flex flex-col justify-between hover:shadow-md transition-shadow">
      <Link to={`/single/${item._id}`} className="group block">
        <div className="relative aspect-square bg-slate-50 rounded-md overflow-hidden flex items-center justify-center p-3 mb-3">
          <img
            src={getProductImageUrl(item.images)}
            onError={handleImageError}
            alt={item.name}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
          />
          {discount > 0 && (
            <span className="absolute top-2 left-2 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">
              {discount}% OFF
            </span>
          )}
        </div>
        {item.brand && (
          <p className="text-[11px] font-medium text-slate-500 truncate">{item.brand}</p>
        )}
        <h3 className="text-sm font-semibold text-slate-900 line-clamp-1 group-hover:text-[#0d2a46]">
          {item.name}
        </h3>
        <div className="mt-1.5 flex items-baseline gap-2 flex-wrap">
          <span className="text-base font-bold text-slate-900">₹{effectivePrice}</span>
          {discount > 0 && (
            <>
              <span className="text-xs text-slate-400 line-through">₹{item.price}</span>
              <span className="text-xs font-semibold text-emerald-700">{discount}% off</span>
            </>
          )}
        </div>
      </Link>

      <button
        type="button"
        onClick={() => onAddCart(item._id)}
        disabled={outOfStock}
        className="mt-3 w-full py-2 rounded-md bg-[#0d2a46] text-white text-xs font-semibold hover:bg-[#123a5c] transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        {outOfStock ? "Out of Stock" : "Add to Cart"}
      </button>
    </div>
  );
};

const HERO_SLIDES = [
  {
    id: "signature",
    badge: "Signature Collection",
    title: "Discover Perfumes That Celebrate You",
    subtitle: "Long-lasting Eau de Parfum & Attar scents crafted for every occasion.",
    cta: "Shop All Perfumes",
    to: "/product",
    bgImage: heroMist,
  },
  {
    id: "oud-amber",
    badge: "Bestselling Woody & Oud",
    title: "Rich Oud, Amber & Evening Scents",
    subtitle: "Deep, lingering fragrances with free doorstep delivery across India.",
    cta: "Explore Best Sellers",
    to: "/product",
    bgImage: heroSpray,
  },
  {
    id: "floral-fresh",
    badge: "Curated Gift Picks",
    title: "Fresh Florals & Velvet Rose",
    subtitle: "Light daytime blooms and signature gifting favourites starting at ₹499.",
    cta: "View Featured",
    to: "/product",
    bgImage: heroFloral,
  },
];

const Home = () => {
  const { addcart } = useContext(Cartcontext);
  const { data } = useContext(Maincontext);
  const { category } = useContext(Categorycontext);
  const { input } = useContext(NavbarContext);
  const [slide, setSlide] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return undefined;
    const timer = setInterval(() => {
      setSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [paused]);

  const prevSlide = () =>
    setSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  const nextSlide = () =>
    setSlide((prev) => (prev + 1) % HERO_SLIDES.length);

  const activeProducts = data.filter((item) => item.isActive !== false);
  const featuredItems = activeProducts.filter((item) => item.isFeatured);
  const baseList = featuredItems.length > 0 ? featuredItems : activeProducts;
  const displayedProducts = input !== "" ? activeProducts.slice(0, 10) : baseList;
  const activeCategories = category.filter((c) => c.isActive !== false);

  return (
    <div className="home-main min-h-screen bg-[#f1f3f6]">
      <NavBar />

      <main className="max-w-7xl mx-auto px-3 sm:px-6 py-4 space-y-4">
        {/* Category Quick Bar (Flipkart style) */}
        {activeCategories.length > 0 && (
          <section aria-label="Categories" className="bg-white border border-slate-200 rounded-lg px-4 py-3">
            <div className="flex items-center gap-2 overflow-x-auto home-featured">
              <Link
                to="/product"
                className="shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#0d2a46] text-white"
              >
                All Perfumes
              </Link>
              {activeCategories.map((cat) => (
                <Link
                  key={cat._id}
                  to={`/product?category=${cat._id}`}
                  className="shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Perfume Store Hero Carousel */}
        <section
          aria-label="Featured promotions"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          className="relative w-full h-[275px] sm:h-[310px] lg:h-[360px] overflow-hidden rounded-lg bg-[#0d2a46] border border-slate-200 shadow-xs"
        >
          <div
            className="flex h-full transition-transform duration-500 ease-out"
            style={{
              width: `${HERO_SLIDES.length * 100}%`,
              transform: `translateX(-${(slide * 100) / HERO_SLIDES.length}%)`,
            }}
          >
            {HERO_SLIDES.map((banner) => (
              <div
                key={banner.id}
                style={{ width: `${100 / HERO_SLIDES.length}%` }}
                className="relative h-full shrink-0"
              >
                <img
                  src={banner.bgImage}
                  alt={banner.title}
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#0d2a46]/90 via-[#0d2a46]/60 to-transparent flex items-center">
                  <div className="px-12 sm:px-14 pb-5 sm:pb-0 max-w-xl text-white">
                    <span className="inline-block bg-white/15 border border-white/25 text-sky-100 text-[10px] sm:text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded">
                      {banner.badge}
                    </span>
                    {banner.id === "signature" ? (
                      <h1 className="mt-2.5 text-xl sm:text-3xl lg:text-4xl font-bold leading-tight">
                        {banner.title}
                      </h1>
                    ) : (
                      <h2 className="mt-2.5 text-xl sm:text-3xl lg:text-4xl font-bold leading-tight">
                        {banner.title}
                      </h2>
                    )}
                    <p className="mt-2 text-xs sm:text-sm text-slate-200 max-w-md">
                      {banner.subtitle}
                    </p>
                    <Link
                      to={banner.to}
                      className="inline-block mt-4 bg-white text-[#0d2a46] px-5 py-2.5 rounded-md font-bold text-xs sm:text-sm hover:bg-slate-100 transition shadow-xs"
                    >
                      {banner.cta}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={prevSlide}
            aria-label="Previous banner"
            className="absolute left-2.5 top-1/2 -translate-y-1/2 bg-white/90 text-slate-800 hover:bg-white w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full shadow transition cursor-pointer"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={nextSlide}
            aria-label="Next banner"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-white/90 text-slate-800 hover:bg-white w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full shadow transition cursor-pointer"
          >
            <ChevronRight size={18} />
          </button>

          {/* Pagination Dots */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
            {HERO_SLIDES.map((banner, idx) => (
              <button
                key={banner.id}
                type="button"
                onClick={() => setSlide(idx)}
                aria-label={`Show banner ${idx + 1}: ${banner.title}`}
                aria-current={slide === idx ? "true" : undefined}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  slide === idx ? "w-6 bg-white" : "w-2 bg-white/45 hover:bg-white/75"
                }`}
              />
            ))}
          </div>
        </section>

        {/* Minimal Trust Strip */}
        <section aria-label="Store highlights" className="grid grid-cols-3 gap-2 sm:gap-3">
          {[
            {
              icon: Truck,
              title: "Fast & Free Delivery",
              desc: "Doorstep shipping on all orders",
            },
            {
              icon: ShieldCheck,
              title: "100% Secure Checkout",
              desc: "Protected UPI & Cash on Delivery",
            },
            {
              icon: Sparkles,
              title: "Authentic Fragrances",
              desc: "Verified quality & lasting notes",
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="bg-white border border-slate-200 rounded-lg p-2.5 sm:px-4 sm:py-3 flex flex-col sm:flex-row items-center text-center sm:text-left gap-1.5 sm:gap-3 shadow-2xs"
              >
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-[#0d2a46]/8 text-[#0d2a46] flex items-center justify-center shrink-0">
                  <Icon size={17} className="sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] sm:text-sm font-bold text-slate-900 leading-tight">
                    {item.title}
                  </p>
                  <p className="mt-0.5 text-[10px] sm:text-xs text-slate-500 leading-snug">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </section>

        {/* Featured Collection */}
        <section className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              {input ? `Search Results for "${input}"` : "Featured Collection"}
            </h2>
            <Link
              to="/product"
              className="px-3.5 py-1.5 bg-[#0d2a46] text-white text-xs font-semibold rounded-md hover:bg-[#123a5c] transition shrink-0"
            >
              View All
            </Link>
          </div>

          {displayedProducts.length === 0 ? (
            <p className="text-sm text-slate-500 py-8 text-center">No fragrances available right now.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
              {displayedProducts.slice(0, 10).map((item) => (
                <ProductCard key={item._id} item={item} onAddCart={addcart} />
              ))}
            </div>
          )}
        </section>

        {/* Offers & New Arrivals */}
        {activeProducts.length > 0 && (
          <section className="bg-white border border-slate-200 rounded-lg p-4">
            <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">Best Value Picks</h2>
              <Link
                to="/product"
                className="text-xs sm:text-sm font-semibold text-[#0d2a46] hover:underline"
              >
                Explore All →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
              {activeProducts.slice(0, 5).map((item) => (
                <ProductCard key={item._id} item={item} onAddCart={addcart} />
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Home;
