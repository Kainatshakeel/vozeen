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
import { HeroSlides } from "@/components/hero-slides";
import { ProductCarousel } from "@/components/product-carousel";
export const dynamic = "force-dynamic";
export default async function Home() {
  const products = await getProducts();
  const formals = products.filter((p) => p.category === "Formals");
  const women = products.filter((p) => p.category === "Women");
  const sale = products.filter((p) => p.compareAt);
  const bestsellers = products.filter((p) => p.featured).slice(0, 8);
  return (
    <>
      <section className="hero">
        <HeroSlides
          panels={[
            [
              {
                src: editorial.heroPanels[0],
                alt: "A crimson chikankari suit with matching dupatta",
              },
              { src: editorial.formals, alt: "A festive formal outfit" },
            ],
            [
              {
                src: editorial.heroPanels[1],
                alt: "A lemon organza three-piece beneath a floral arch",
              },
              { src: editorial.story, alt: "Hand embroidery close-up" },
            ],
            [
              {
                src: editorial.heroPanels[2],
                alt: "A lilac embroidered suit with a printed dupatta",
              },
              {
                src: women[1]?.images[0] ?? editorial.formals,
                alt: "An embroidered Vozeen suit",
              },
            ],
          ]}
        />
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
      <section className="container categories-section top">
        <div className="section-heading">
          <div>
            <p className="eyebrow muted">Categories</p>
            <h2>Shop by occasion</h2>
          </div>
          <span className="section-caption">
            From everyday lawn to bridal couture.
          </span>
        </div>
        <div className="category-grid four">
          {[
            ["Women", "Lawn, chikankari & pret", editorial.women, ""],
            ["Formals", "Bridal, festive & wedding wear", editorial.formals, ""],
            ["Men", "Kurta shalwar & kameez", editorial.men, "soon"],
            ["Kids", "Little ones, big occasions", editorial.story, "soon"],
          ].map(([name, caption, src, soon]) => (
            <Link
              className={soon ? "category-card is-soon" : "category-card"}
              href={soon ? `/${name.toLowerCase()}` : `/shop?category=${name}`}
              key={name}
            >
              {soon && <span className="soon-badge">Coming soon</span>}
              <Image
                src={src}
                alt={`${name} collection`}
                fill
                sizes="(max-width: 650px) 100vw, 33vw"
              />
              <div>
                <p>{caption}</p>
                <h3>{name}</h3>
              </div>
            </Link>
          ))}
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
        <ProductCarousel
          groups={[
            { label: "All", products: products.slice(0, 10) },
            { label: "Women", products: women.slice(0, 10) },
            { label: "Formals", products: formals.slice(0, 10) },
          ].filter((g) => g.products.length > 0)}
        />
        <div className="collection-footnote">
          <span>Every stitch, considered.</span>
          <span>Designed and crafted in Pakistan.</span>
        </div>
      </section>
      <section className="video-feature">
        <Image
          className="video-feature-bg"
          src={editorial.story}
          alt=""
          fill
          sizes="100vw"
        />
        <div className="video-feature-shade" />
        <div className="video-feature-copy">
          <p className="eyebrow">The festive edit</p>
          <h2>Dressed for every celebration</h2>
          <p>
            Embroidered organza, chikankari and luxe formals for mehndi nights,
            nikah days and everything in between.
          </p>
          <Link className="button button-cream" href="/shop?category=Formals">
            Explore the edit
          </Link>
        </div>
      </section>
      <section className="duo">
        {[
          ["Women", "Lawn, pret & chikankari", editorial.women],
          ["Formals", "Bridal, festive & wedding wear", editorial.formals],
        ].map(([name, caption, src]) => (
          <Link className="duo-card" href={`/shop?category=${name}`} key={name}>
            <Image
              src={src}
              alt={`${name} collection`}
              fill
              sizes="(max-width: 700px) 100vw, 50vw"
            />
            <div>
              <p>{caption}</p>
              <h3>{name}</h3>
              <span>Shop now</span>
            </div>
          </Link>
        ))}
      </section>
      {bestsellers.length > 0 && (
        <section className="container section">
          <div className="section-heading">
            <div>
              <p className="eyebrow muted">Most loved</p>
              <h2>Bestsellers</h2>
            </div>
            <Link className="text-link" href="/shop">
              Shop all <ArrowUpRight size={17} />
            </Link>
          </div>
          <ProductCarousel
            groups={[{ label: "Bestsellers", products: bestsellers }]}
          />
        </section>
      )}
      {sale.length > 0 && (
        <section className="sale-band">
          <div className="container">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Limited time</p>
                <h2>Sale</h2>
              </div>
              <Link className="text-link" href="/shop">
                Shop the sale <ArrowUpRight size={17} />
              </Link>
            </div>
            <div className="product-grid">
              {sale.slice(0, 4).map((p, i) => (
                <ProductCard product={p} index={i} key={p.id} />
              ))}
            </div>
          </div>
        </section>
      )}
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
          {products.slice(4, 8).slice(0, 4).map((p) => (
            <Link key={p.id} href={`/product/${p.slug}`}>
              <Image src={p.images[0]} alt={p.name} fill sizes="25vw" />
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
