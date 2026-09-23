import type { Metadata } from "next";
import { Jost } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/cart-provider";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { CartDrawer } from "@/components/cart-drawer";
const sans = Jost({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});
export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://vozeen.com",
  ),
  title: {
    default: "Vozeen — Eastern wear, elevated.",
    template: "%s | Vozeen",
  },
  description:
    "Shop Pakistani Eastern wear at Vozeen: embroidered lawn, chikankari, kurta shalwar for men, and bridal and formal couture. Cash on delivery across Pakistan.",
  openGraph: {
    title: "Vozeen — Eastern wear, elevated.",
    description: "Heritage, reimagined. Discover the festive collection.",
    type: "website",
  },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={sans.variable}>
      {/* Browser extensions (e.g. ColorZilla) inject body attributes before hydration. */}
      <body suppressHydrationWarning>
        <CartProvider>
          <a className="skip-link" href="#main-content">
            Skip to content
          </a>
          <Header />
          <main id="main-content">{children}</main>
          <Footer />
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
