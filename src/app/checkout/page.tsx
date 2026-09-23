import { CheckoutForm } from "@/components/checkout-form";
import { enabledPayments } from "@/lib/payments";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
export const metadata = {
  title: "Secure checkout",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";
export default async function Checkout() {
  const user = process.env.DATABASE_URL ? await currentUser() : null;
  const addresses = user
    ? await db.address.findMany({ where: { userId: user.id } })
    : [];
  return (
    <div className="container">
      <div className="page-heading">
        <div className="breadcrumb">Your bag / Checkout</div>
        <h1>Almost yours.</h1>
        <p>A few details, and we’ll take it from here.</p>
      </div>
      <CheckoutForm
        methods={enabledPayments()}
        addresses={addresses}
        email={user?.email}
      />
    </div>
  );
}
