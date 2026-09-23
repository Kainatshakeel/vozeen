import { AuthForm } from "@/components/auth-form";
export const metadata = { title: "Create an account" };
export default function Signup() {
  return (
    <div className="form-page">
      <p className="eyebrow muted">MAKE YOURSELF AT HOME</p>
      <h1>Your Vozeen starts here.</h1>
      <AuthForm signup />
    </div>
  );
}
