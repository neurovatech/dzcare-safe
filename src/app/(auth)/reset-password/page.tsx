import type { Metadata } from "next";
import { Suspense } from "react";
import AuthShell from "@/components/AuthShell";
import { ResetPasswordForm } from "@/components/AuthForms";

export const metadata: Metadata = {
  title: "Reset Password",
  robots: { index: false },
  referrer: "no-referrer",
};

export default function ResetPasswordPage({ searchParams }: PageProps<"/reset-password">) {
  return (
    <AuthShell title="Set a new password" text="Choose a strong password with at least 8 characters.">
      <Suspense fallback={<p className="text-sm text-neutral-500">Loading…</p>}>
        {searchParams.then((sp) => (
          <ResetPasswordForm token={typeof sp.token === "string" ? sp.token : ""} />
        ))}
      </Suspense>
    </AuthShell>
  );
}
