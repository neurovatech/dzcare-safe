import type { Metadata } from "next";
import { Suspense } from "react";
import AuthShell from "@/components/AuthShell";
import { SignUpForm } from "@/components/AuthForms";

export const metadata: Metadata = {
  title: "Create Account",
  robots: { index: false },
  alternates: { canonical: "/signup" },
};

export default function SignUpPage({ searchParams }: PageProps<"/signup">) {
  return (
    <AuthShell title="Create your account" text="Book repairs faster, track orders and keep your warranty records in one place.">
      <Suspense fallback={<SignUpForm />}>
        {searchParams.then((sp) => (
          <SignUpForm next={typeof sp.next === "string" ? sp.next : ""} />
        ))}
      </Suspense>
    </AuthShell>
  );
}
