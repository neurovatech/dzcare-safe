import type { Metadata } from "next";
import AuthShell from "@/components/AuthShell";
import { ForgotPasswordForm } from "@/components/AuthForms";

export const metadata: Metadata = {
  title: "Forgot Password",
  robots: { index: false },
  alternates: { canonical: "/forgot-password" },
};

export default function ForgotPasswordPage() {
  return (
    <AuthShell title="Forgot your password?" text="Enter your account email and we'll send you a secure link to reset it.">
      <ForgotPasswordForm />
    </AuthShell>
  );
}
