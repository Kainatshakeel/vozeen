import { TrackingForm } from "@/components/tracking-form";
export const metadata = { title: "Track your order" };
export default function Track() {
  return (
    <div className="form-page">
      <p className="eyebrow muted">FROM OUR STUDIO TO YOUR DOOR</p>
      <h1>Follow your good finds.</h1>
      <TrackingForm />
    </div>
  );
}
