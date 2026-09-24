import { SignIn } from '@clerk/react';

/**
 * Clerk's own sign-in (brief section 6.1). Public sign-up is closed in the
 * Clerk instance itself (D-009); officers arrive by invitation only.
 */
export function SignInPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <SignIn routing="hash" />
    </main>
  );
}
