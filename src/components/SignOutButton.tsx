"use client";

import { signOut } from "@/app/(auth)/actions";
import { clearAuthTokens } from "@/lib/auth-client";

/**
 * Sign-out button that:
 *  1. Clears the client-side auth tokens (localStorage + dc_auth cookie)
 *  2. Calls the server action to end the session
 */
export default function SignOutButton() {
  return (
    <form
      action={async () => {
        clearAuthTokens();
        await signOut();
      }}
    >
      <button
        type="submit"
        className="h-11 w-full rounded-full bg-red-50 text-sm font-semibold text-red-700 transition hover:bg-red-100"
      >
        Sign out
      </button>
    </form>
  );
}
