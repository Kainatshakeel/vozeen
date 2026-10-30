import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
export function ComingSoon({
  title,
  blurb,
}: {
  title: string;
  blurb: string;
}) {
  return (
    <section className="coming-soon">
      <p className="eyebrow">Coming soon</p>
      <h1>{title}</h1>
      <p>{blurb}</p>
      <div className="coming-soon-actions">
        <Link className="button" href="/shop?category=Women">
          Shop women
        </Link>
        <Link className="button button-outline" href="/shop?category=Formals">
          Shop formals
        </Link>
      </div>
      <Link className="text-link" href="/contact">
        Ask us about launch dates <ArrowUpRight size={17} />
      </Link>
    </section>
  );
}
