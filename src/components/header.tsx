"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowUpRight,
  Search,
  UserRound,
  ShoppingBag,
  Menu,
  X,
} from "lucide-react";
import { useCart } from "./cart-provider";
export function Header() {
  const { count, openDrawer } = useCart();
  const path = usePathname();
  const router = useRouter();
  const [menu, setMenu] = useState(false);
  const [search, setSearch] = useState(false);
  return (
    <>
      <div className="announcement">
        The festive collection is here.{" "}
        <span>Free shipping on orders over Rs. 15,000</span>
        <ArrowUpRight size={13} />
      </div>
      <header className="site-header">
        <div className="header-inner">
          <button
            className="icon-button mobile-menu"
            aria-label="Open menu"
            onClick={() => setMenu(!menu)}
          >
            {menu ? <X size={21} /> : <Menu size={21} />}
          </button>
          <Link className="wordmark" href="/" aria-label="Vozeen home">
            vozeen<span>®</span>
          </Link>
          <nav
            className={menu ? "navigation open" : "navigation"}
            aria-label="Main navigation"
          >
            {[
              ["/", "Home"],
              ["/shop", "Shop all"],
              ["/shop?category=Women", "Women"],
              ["/shop?category=Men", "Men"],
              ["/shop?sort=new", "New arrivals"],
              ["/about", "Our story"],
            ].map(([href, label]) => (
              <Link
                key={label}
                href={href}
                onClick={() => setMenu(false)}
                className={path === "/" && href === "/" ? "active" : ""}
              >
                {label}
                {label === "New arrivals" && <i />}
              </Link>
            ))}
          </nav>
          <div className="header-actions">
            <button
              className="icon-button"
              aria-label="Search products"
              onClick={() => setSearch(!search)}
            >
              <Search size={20} />
            </button>
            <Link
              className="icon-button account-icon"
              href="/account"
              aria-label="My account"
            >
              <UserRound size={20} />
            </Link>
            <button
              type="button"
              className="bag-link"
              onClick={openDrawer}
              aria-label={`Open shopping bag, ${count} items`}
            >
              <ShoppingBag size={20} />
              <span className="bag-count">{count}</span>
            </button>
          </div>
        </div>
        {search && (
          <form
            className="search-bar"
            onSubmit={(e) => {
              e.preventDefault();
              const q = new FormData(e.currentTarget).get("q");
              router.push(`/shop?q=${encodeURIComponent(String(q))}`);
              setSearch(false);
            }}
          >
            <Search size={18} />
            <input
              autoFocus
              name="q"
              placeholder="Search lawn, kurta, bridal…"
              aria-label="Search"
            />
            <button>Search →</button>
          </form>
        )}
      </header>
    </>
  );
}
