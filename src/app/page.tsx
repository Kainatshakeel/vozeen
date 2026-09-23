import Link from "next/link";
import Image from "next/image";
import {
  ArrowUpRight,
  ArrowRight,
  Truck,
  RefreshCcw,
  Banknote,
  Sparkles,
} from "lucide-react";
import { editorial, getProducts } from "@/lib/catalog";
import { ProductCard } from "@/components/product-card";
export const dynamic = "force-dynamic";
export default async function Home() {
  const products = await getProducts();
  const formals = products.filter((p) => p.category === "Formals");
  const men = products.filter((p) => p.category === "Men");
  const arrivals = [
    ...products.filter((p) => p.category === "Women").slice(0, 4),
    ...men.slice(0, 4),
  ];
  return (
    <>
      <section className="hero">
        <div className="hero-media">
          {editorial.heroPanels.map((src, i) => (
            <div className="hero-panel" key={src}>
              <Image
                src={src}
                alt={
                  [
                    "A crimson chikankari suit with matching dupatta",
                    "A lemon organza three-piece beneath a floral arch",
                    "A lilac embroidered suit with a printed dupatta",
                  ][i]
                }
                fill
                priority={i < 2}
                sizes="(max-width: 860px) 100vw, 34vw"
                className="hero-image"
              />
            </div>
          ))}
          <div className="hero-shade" />
        </div>
        <div className="hero-copy">
          <div className="eyebrow">The festive edit — 2026</div>
          <h1>Heritage, reimagined</h1>
          <p>
            Hand-finished embroidery, breathable lawn and luxe formals, designed
            in Pakistan.
          </p>
          <div className="hero-actions">
            <Link className="button button-cream" href="/shop?category=Women">
              Shop women
            </Link>
            <Link className="button button-ghost" href="/shop?category=Men">
              Shop men
            </Link>
            <Link className="button button-ghost" href="/shop?category=Formals">
              Formals
            </Link>
          </div>
        </div>
      </section>
      <section className="benefits">
        <div>
          <Truck size={19} />
          <span>
            Free delivery <small>On orders over Rs. 15,000</small>
          </span>
        </div>
        <div>
          <Sparkles size={19} />
          <span>
            Hand-finished <small>Embroidery by skilled artisans</small>
          </span>
        </div>
        <div>
          <RefreshCcw size={18} />
          <span>
            Easy exchanges <small>Within 14 days of delivery</small>
          </span>
        </div>
        <div>
          <Banknote size={19} />
          <span>
            Cash on delivery <small>Pay when your order arrives</small>
          </span>
        </div>
      </section>
      <section className="container section" id="new-arrivals">
        <div className="section-heading">
          <div>
            <p className="eyebrow muted">Just in</p>
            <h2>New arrivals</h2>
          </div>
          <Link className="text-link" href="/shop?sort=new">
            Shop new arrivals <ArrowUpRight size={17} />
          </Link>
        </div>
        <div className="product-grid">
          {arrivals.map((p, i) => (
            <ProductCard product={p} index={i} key={p.id} />
          ))}
        </div>
        <div className="collection-footnote">
          <span>Every stitch, considered.</span>
          <span>Designed and crafted in Pakistan.</span>
        </div>
      </section>
      <section className="container categories-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow muted">Categories</p>
            <h2>Shop by occasion</h2>
          </div>
          <span className="section-caption">
            From everyday lawn to bridal couture.
          </span>
        </div>
        <div className="category-grid">
          {[
            ["Women", "Lawn, chikankari & pret", editorial.women],
            ["Men", "Kurta shalwar & kameez", editorial.men],
            ["Formals", "Bridal, festive & wedding wear", editorial.formals],
          ].map(([name, caption, src]) => (
            <Link
              className="category-card"
              href={`/shop?category=${name}`}
              key={name}
            >
              <Image
                src={src}
                alt={`${name} collection`}
                fill
                sizes="(max-width: 650px) 100vw, 33vw"
              />
              <div>
                <p>{caption}</p>
                <h3>
                  {name}
                  <ArrowUpRight size={25} />
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </section>
      <section className="story-section">
        <div className="story-image">
          <Image
            src={editorial.story}
            alt="Close-up of colourful hand embroidery on fabric"
            fill
            sizes="(max-width: 700px) 100vw, 50vw"
          />
          <span>HAND-FINISHED IN PAKISTAN</span>
        </div>
        <div className="story-copy">
          <p className="eyebrow muted">Our craft</p>
          <h2>
            Rooted in tradition,
            <br />
            made for <em>today</em>
          </h2>
          <p>
            Every Vozeen piece begins with craft: chikankari passed down through
            generations, zardozi worked by hand, and fabrics chosen to breathe
            through Pakistani summers.
          </p>
          <p>Timeless techniques. Modern cuts.</p>
          <Link className="text-link" href="/about">
            Our story <ArrowUpRight size={17} />
          </Link>
        </div>
      </section>
      {formals.length > 0 && (
        <section className="container section">
          <div className="section-heading">
            <div>
              <p className="eyebrow muted">Wedding season</p>
              <h2>Bridal & formals</h2>
            </div>
            <Link className="text-link" href="/shop?category=Formals">
              View all formals <ArrowUpRight size={17} />
            </Link>
          </div>
          <div className="product-grid">
            {formals.slice(0, 4).map((p, i) => (
              <ProductCard product={p} index={i} key={p.id} />
            ))}
          </div>
        </section>
      )}
      <section className="community container">
        <span className="eyebrow muted">#WEARVOZEEN</span>
        <h2>Worn with pride</h2>
        <p>From mehndi nights to Jummah mornings, real moments in Vozeen.</p>
        <Link href="/shop" className="text-link">
          Shop the collection <ArrowRight size={16} />
        </Link>
        <div className="community-images">
          {[...men.slice(4), ...products.slice(4, 8)].slice(0, 4).map((p) => (
            <Link key={p.id} href={`/product/${p.slug}`}>
              <Image src={p.images[0]} alt={p.name} fill sizes="25vw" />
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
