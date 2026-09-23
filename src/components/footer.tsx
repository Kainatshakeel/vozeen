import Link from "next/link";
import { ArrowUpRight, Instagram, MessageCircle } from "lucide-react";
export function Footer() {
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  return (
    <>
      <footer>
        <div className="footer-main container">
          <div className="footer-brand">
            <Link href="/" className="wordmark">
              vozeen<span>®</span>
            </Link>
            <p>
              Eastern wear, elevated.
              <br />
              Designed and hand-finished in Pakistan.
            </p>
            <a href="https://www.instagram.com/" aria-label="Instagram">
              <Instagram size={18} />
            </a>
          </div>
          <div>
            <h4>Explore</h4>
            <Link href="/shop">Shop all</Link>
            <Link href="/shop?category=Women">Women</Link>
            <Link href="/shop?category=Men">Men</Link>
            <Link href="/about">Our story</Link>
          </div>
          <div>
            <h4>Here to help</h4>
            <Link href="/contact">Contact us</Link>
            <Link href="/size-guide">Size guide</Link>
            <Link href="/shipping">Shipping & delivery</Link>
            <Link href="/returns">Returns & exchanges</Link>
          </div>
          <div>
            <h4>Your Vozeen</h4>
            <Link href="/account">My account</Link>
            <Link href="/track">Track your order</Link>
            <Link href="/account?tab=wishlist">
              Your wishlist <ArrowUpRight size={12} />
            </Link>
            <p className="footer-location">
              Designed with intention.
              <br />
              Based in Pakistan.
            </p>
          </div>
        </div>
        <div className="footer-bottom container">
          <span>© {new Date().getFullYear()} Vozeen. All rights reserved.</span>
          <span>Pakistan · PKR</span>
          <div className="payment-marks">
            <b>VISA</b>
            <b>mastercard</b>
            <b>JazzCash</b>
            <b>easypaisa</b>
            <span>COD</span>
          </div>
        </div>
      </footer>
      {phone && (
        <a
          className="whatsapp"
          href={`https://wa.me/${phone.replace(/\D/g, "")}`}
          target="_blank"
          rel="noreferrer"
          aria-label="Chat with us on WhatsApp"
        >
          <MessageCircle size={23} />
        </a>
      )}
    </>
  );
}
