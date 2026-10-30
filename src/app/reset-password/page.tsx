import Link from "next/link";
import { ResetForm } from "@/components/reset-forms";
export const metadata = {
  title: "Reset password",
  robots: { index: false, follow: false },
};
export default async function ResetPassword({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  return (
    <div className="form-page">
      <p className="eyebrow muted">ACCOUNT HELP</p>
      <h1>Choose a new password.</h1>
      {token ? (
        <ResetForm token={token} />
      ) : (
        <p>
          This link is incomplete.{" "}
          <Link href="/forgot-password" style={{ textDecoration: "underline" }}>
            Request a new one
          </Link>
          .
        </p>
      )}
    </div>
  );
}
