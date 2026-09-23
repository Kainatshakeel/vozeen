import Link from "next/link";
export default function NotFound() {
  return (
    <div className="container section">
      <div className="empty-state">
        <p className="eyebrow muted" style={{ justifyContent: "center" }}>
          A LITTLE OFF THE BEATEN PATH
        </p>
        <h2>This page has moved on.</h2>
        <p>Let’s find something you’ll love.</p>
        <Link className="button" href="/shop">
          Back to the collection ↗
        </Link>
      </div>
    </div>
  );
}
