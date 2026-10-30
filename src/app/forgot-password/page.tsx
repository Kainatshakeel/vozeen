import { ForgotForm } from "@/components/reset-forms";
export const metadata = {
  title: "Forgot password",
  robots: { index: false, follow: false },
};
export default function ForgotPassword() {
  return (
    <div className="form-page">
      <p className="eyebrow muted">ACCOUNT HELP</p>
      <h1>Forgot your password?</h1>
      <p className="small-note">
        Enter your email and we will send you a link to choose a new one.
      </p>
      <ForgotForm />
    </div>
  );
}
