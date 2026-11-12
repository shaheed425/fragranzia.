import { useContext, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Search, ShoppingCart, Heart, User, Menu, X, Package } from "lucide-react";
import { Cartcontext, NavbarContext } from "../Contexts/contexts";
import useAuth from "../Hooks/useAuth";

const NavBar = () => {
  const { search, input, setInput } = useContext(NavbarContext);
  const { cart } = useContext(Cartcontext);
  const { auth, setAuth } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isLoggedIn = !!auth?.token;
  const cartCount = Array.isArray(cart)
    ? cart.reduce((sum, item) => sum + (item?.product ? item.quantity || 1 : 0), 0)
    : 0;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("name");
    localStorage.removeItem("email");
    setAuth({});
    setOpen(false);
    navigate("/login");
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (location.pathname !== "/product") {
      navigate("/product");
    }
    setOpen(false);
  };

  const handleClearSearch = () => {
    setInput("");
    search({ target: { value: "" } });
  };

  return (
    <header className="sticky top-0 z-50 bg-[#0d2a46] text-white shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-3 sm:gap-6">
        {/* Brand */}
        <Link
          to="/"
          className="text-xl sm:text-2xl font-bold tracking-tight text-white shrink-0 hover:opacity-90 transition-opacity"
        >
          Fragranzia
        </Link>

        {/* Desktop & Tablet Search */}
        <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-xl relative">
          <input
            value={input}
            onChange={search}
            type="search"
            aria-label="Search perfumes by name or brand"
            placeholder="Search for perfumes, brands and scents..."
            className="w-full pl-4 pr-16 py-2 bg-white text-slate-900 rounded-md text-sm placeholder:text-slate-400 focus:outline-none"
          />
          {input && (
            <button
              type="button"
              onClick={handleClearSearch}
              aria-label="Clear search"
              className="absolute right-9 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1"
            >
              <X size={15} />
            </button>
          )}
          <button
            type="submit"
            aria-label="Search"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-[#0d2a46] p-1.5 hover:bg-slate-100 rounded"
          >
            <Search size={17} />
          </button>
        </form>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-5 text-sm font-medium shrink-0">
          <Link to="/product" className="text-slate-100 hover:text-white transition-colors">
            Shop
          </Link>

          {isLoggedIn && (
            <Link
              to="/orderdetails"
              className="flex items-center gap-1.5 text-slate-100 hover:text-white transition-colors"
            >
              <Package size={16} />
              <span>Orders</span>
            </Link>
          )}

          {isLoggedIn && (
            <Link
              to="/wishlist"
              aria-label="Wishlist"
              className="flex items-center gap-1.5 text-slate-100 hover:text-white transition-colors"
            >
              <Heart size={17} />
              <span className="hidden lg:inline">Wishlist</span>
            </Link>
          )}

          <Link
            to="/cart"
            aria-label="Shopping cart"
            className="relative flex items-center gap-1.5 text-slate-100 hover:text-white transition-colors"
          >
            <ShoppingCart size={18} />
            <span>Cart</span>
            {cartCount > 0 && (
              <span className="ml-0.5 px-1.5 py-0.5 text-[11px] font-bold leading-none bg-amber-400 text-[#0d2a46] rounded-full">
                {cartCount}
              </span>
            )}
          </Link>

          {isLoggedIn ? (
            <div className="flex items-center gap-3 pl-2 border-l border-white/20">
              <Link
                to="/profile"
                className="flex items-center gap-1.5 text-slate-100 hover:text-white transition-colors"
                aria-label="My Profile"
              >
                <User size={17} />
                <span className="max-w-[90px] truncate">{auth?.name || "Account"}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 rounded bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition cursor-pointer"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 pl-2 border-l border-white/20">
              <Link
                to="/login"
                className="px-4 py-1.5 rounded bg-white text-[#0d2a46] font-semibold text-xs hover:bg-slate-100 transition"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-3 py-1.5 rounded border border-white/30 text-white text-xs font-medium hover:bg-white/10 transition"
              >
                Sign Up
              </Link>
            </div>
          )}
        </nav>

        {/* Mobile Right Icons + Menu Button */}
        <div className="flex md:hidden items-center gap-3">
          <Link to="/cart" aria-label="Cart" className="relative p-1.5 text-white">
            <ShoppingCart size={20} />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 px-1.5 py-0.5 text-[10px] font-bold leading-none bg-amber-400 text-[#0d2a46] rounded-full">
                {cartCount}
              </span>
            )}
          </Link>
          <button
            onClick={() => setOpen(!open)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="p-1.5 rounded hover:bg-white/10 transition"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Search Strip (Always accessible like Flipkart mobile) */}
      <div className="md:hidden px-3 pb-2.5">
        <form onSubmit={handleSearchSubmit} className="relative flex items-center">
          <input
            value={input}
            onChange={search}
            type="search"
            aria-label="Search perfumes"
            placeholder="Search for perfumes, brands..."
            className="w-full pl-3.5 pr-10 py-2 bg-white text-slate-900 rounded-md text-sm placeholder:text-slate-400 focus:outline-none"
          />
          <button
            type="submit"
            aria-label="Search"
            className="absolute right-2 text-[#0d2a46] p-1"
          >
            <Search size={17} />
          </button>
        </form>
      </div>

      {/* Mobile Drawer Menu */}
      {open && (
        <div className="md:hidden bg-white text-slate-800 border-t border-slate-200 shadow-lg px-4 py-3">
          <ul className="flex flex-col divide-y divide-slate-100 text-sm font-medium">
            <li>
              <Link onClick={() => setOpen(false)} className="block py-2.5 hover:text-[#0d2a46]" to="/">
                Home
              </Link>
            </li>
            <li>
              <Link onClick={() => setOpen(false)} className="block py-2.5 hover:text-[#0d2a46]" to="/product">
                All Perfumes
              </Link>
            </li>
            <li>
              <Link onClick={() => setOpen(false)} className="block py-2.5 hover:text-[#0d2a46]" to="/cart">
                Cart {cartCount > 0 ? `(${cartCount})` : ""}
              </Link>
            </li>
            {isLoggedIn ? (
              <>
                <li>
                  <Link onClick={() => setOpen(false)} className="block py-2.5 hover:text-[#0d2a46]" to="/wishlist">
                    Wishlist
                  </Link>
                </li>
                <li>
                  <Link onClick={() => setOpen(false)} className="block py-2.5 hover:text-[#0d2a46]" to="/orderdetails">
                    My Orders
                  </Link>
                </li>
                <li>
                  <Link onClick={() => setOpen(false)} className="block py-2.5 hover:text-[#0d2a46]" to="/profile">
                    My Profile ({auth?.name || "Account"})
                  </Link>
                </li>
                <li>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left py-2.5 text-rose-600 font-semibold"
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link onClick={() => setOpen(false)} className="block py-2.5 text-[#0d2a46] font-semibold" to="/login">
                    Login
                  </Link>
                </li>
                <li>
                  <Link onClick={() => setOpen(false)} className="block py-2.5 hover:text-[#0d2a46]" to="/register">
                    Sign Up
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      )}
    </header>
  );
};

export default NavBar;
