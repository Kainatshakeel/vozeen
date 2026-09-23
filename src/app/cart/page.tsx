import { CartPage } from "@/components/cart-page";
export const metadata = { title: "Your shopping bag" };
export default function Cart() {
  return (
    <div className="container">
      <div className="page-heading">
        <div className="breadcrumb">Home / Your bag</div>
        <h1>Your good finds.</h1>
        <p>Review your pieces, then check out.</p>
      </div>
      <CartPage />
    </div>
  );
}
