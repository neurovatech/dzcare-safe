import type { Metadata } from "next";
import { Suspense } from "react";
import AuthShell from "@/components/AuthShell";
import { SignInForm } from "@/components/AuthForms";

export const metadata: Metadata = {
  title: "Sign In",
  robots: { index: false },
  alternates: { canonical: "/signin" },
};

export default function SignInPage({ searchParams }: PageProps<"/signin">) {
  return (
    <AuthShell title="Welcome back" text="Sign in to manage your repair orders and checkout faster.">
      <Suspense fallback={<SignInForm />}>
        {searchParams.then((sp) => (
          <SignInForm next={typeof sp.next === "string" ? sp.next : ""} />
        ))}
      </Suspense>
    </AuthShell>
  );
}
