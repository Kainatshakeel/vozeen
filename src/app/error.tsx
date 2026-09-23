"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="container section">
      <div className="empty-state">
        <h2>Something needs a moment.</h2>
        <p>We couldn’t load this page. Please try again.</p>
        <button className="button" onClick={reset}>
          Try again
        </button>
      </div>
    </div>
  );
}
