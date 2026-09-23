import { AuthForm } from "@/components/auth-form";
export const metadata = { title: "Sign in" };
export default function Login() {
  return (
    <div className="form-page">
      <p className="eyebrow muted">YOUR VOZEEN, ALL IN ONE PLACE</p>
      <h1>Welcome back.</h1>
      <AuthForm />
    </div>
  );
}
