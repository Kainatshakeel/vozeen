import { notFound } from "next/navigation";
import Link from "next/link";
import { chartSets } from "@/lib/size-charts";
import { SizeChart } from "@/components/size-chart";
const pages = {
  about: {
    title: "Heritage, reimagined.",
    eyebrow: "THE VOZEEN STORY",
    intro:
      "Vozeen is an Eastern wear label from Pakistan. We take the crafts we grew up with, like chikankari, zardozi and fine lawn, and shape them into pieces that feel right for how we dress today.",
    sections: [
      [
        "Craft at the heart.",
        "Our embroidery is worked by skilled artisans, and many pieces are finished by hand. That means every shirt, dupatta and lehenga carries small, beautiful differences, the signature of something made with care.",
      ],
      [
        "For every occasion.",
        "From breathable lawn for long summer days to kurta shalwar for Jummah and festive formals for mehndi, baraat and walima, we design for the moments that matter in Pakistani life.",
      ],
      [
        "An ongoing conversation.",
        "We are building Vozeen one piece, and one conversation, at a time. Have a question or an idea? We would love to hear from you.",
      ],
    ],
  },
  shipping: {
    title: "Good things, delivered.",
    eyebrow: "SHIPPING & DELIVERY",
    intro:
      "We deliver across Pakistan. Shipping is complimentary on orders of Rs. 15,000 or more; a flat Rs. 250 applies to smaller orders.",
    sections: [
      [
        "Getting your order ready",
        "Orders are usually prepared within 1–2 business days after confirmation. Allow an estimated 3–7 business days for delivery, depending on your location. These are estimates; public holidays, remote destinations, and courier delays may affect timing.",
      ],
      [
        "Following the journey",
        "Save your private tracking link from the order confirmation page. Signed-in customers can also follow order progress from their account. Contact us with your order ID if your parcel is taking longer than expected.",
      ],
      [
        "Cash on delivery",
        "COD is available at checkout for Pakistani delivery addresses. Please provide a reachable mobile number and have the order total ready when the courier arrives.",
      ],
      [
        "A change of plans?",
        "Contact us promptly if you need to update a delivery address. Once an order has shipped, we may be unable to make changes.",
      ],
    ],
  },
  returns: {
    title: "Find your perfect fit.",
    eyebrow: "RETURNS & REFUNDS",
    intro:
      "We want your pieces to feel right. You may request a return or exchange within 14 days of delivery for eligible items.",
    sections: [
      [
        "What can be returned?",
        "Items must be unworn, unwashed, and in their original condition, with tags and packaging intact. Items marked final sale and items altered or damaged after delivery are not eligible.",
      ],
      [
        "How to start a return",
        "Email hello@vozeen.com with your order ID, the item you would like to return, and the reason. For faulty or incorrect items, include clear photos. Wait for return instructions before sending anything back.",
      ],
      [
        "Refunds and exchanges",
        "Once your return is received and inspected, we will confirm the outcome. Approved online-payment refunds are sent to the original payment method; COD refunds require a bank-transfer arrangement with support. Allow an estimated 7–14 business days after approval for processing.",
      ],
      [
        "Delivery charges",
        "For faulty or incorrect items, we cover reasonable return shipping. For a change of mind or size, the customer pays return shipping. Original delivery charges are not refunded unless the issue was our mistake.",
      ],
    ],
  },
  "size-guide": {
    title: "A fit that feels like you.",
    eyebrow: "THE SIZE GUIDE",
    intro:
      "These charts list garment measurements, not body measurements. Compare them with a similar piece you already own, laid flat, for the most reliable fit. Every product page also has its own size chart.",
    sections: [
      [
        "How to measure",
        "Lay a shirt or trouser that fits you well on a flat surface. Chest: measure straight across, armpit to armpit. Length: from the highest point of the shoulder to the hem. Waist and hip: measure straight across the trouser. Compare these numbers with the charts above.",
      ],
      [
        "Between sizes?",
        "Choose the smaller size for a closer fit or the larger size for a more relaxed feel. For individual product measurements, contact our team before placing your order.",
      ],
      [
        "Kameez length and formals",
        "Kameez and kurta lengths vary by style and are listed in the product details. Bridal and formal pieces are made to order; our team will confirm your measurements on WhatsApp before stitching begins.",
      ],
    ],
  },
  contact: {
    title: "Let’s talk.",
    eyebrow: "HERE FOR THE LITTLE THINGS",
    intro:
      "A question about fit, a piece you love, or an order on its way? Our team is here to help.",
    sections: [
      [
        "Write to us",
        "Email hello@vozeen.com. Please include your order ID when contacting us about a purchase. Never send card numbers, PINs, passwords, or payment OTPs.",
      ],
      [
        "Studio hours",
        "Monday to Saturday, 10 am–6 pm Pakistan Standard Time. We aim to reply within two business days.",
      ],
    ],
  },
} as const;
type Key = keyof typeof pages;
export function generateStaticParams() {
  return Object.keys(pages).map((page) => ({ page }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ page: string }>;
}) {
  const { page } = await params;
  return { title: pages[page as Key]?.title || "Not found" };
}
export default async function StaticPage({
  params,
}: {
  params: Promise<{ page: string }>;
}) {
  const { page } = await params;
  if (!(page in pages)) notFound();
  const data = pages[page as Key];
  return (
    <article className="container content-page">
      <div className="breadcrumb">
        <Link href="/">Home</Link> / {page.replace("-", " ")}
      </div>
      <p className="eyebrow muted">{data.eyebrow}</p>
      <h1>{data.title}</h1>
      <p>{data.intro}</p>
      {page === "size-guide" && (
        <div className="size-guide-sets">
          {(["women-suit", "men-suit"] as const).map((set) => (
            <section key={set}>
              <h2>{chartSets[set].label}</h2>
              <SizeChart set={set} />
            </section>
          ))}
        </div>
      )}
      {data.sections.map(([heading, text]) => (
        <section key={heading}>
          <h2>{heading}</h2>
          <p>{text}</p>
        </section>
      ))}
      {page === "contact" ? (
        <a
          href="mailto:hello@vozeen.com"
          className="button"
          style={{ marginTop: 20 }}
        >
          Email the studio ↗
        </a>
      ) : (
        <Link href="/shop" className="text-link" style={{ marginTop: 20 }}>
          Explore the collection ↗
        </Link>
      )}
    </article>
  );
}
