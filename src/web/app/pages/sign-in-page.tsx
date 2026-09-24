import { SignIn } from '@clerk/react';

// D-043: officers arrive by invitation only (brief section 6.2), so the
// sign-in screen never offers the "Sign up" link. Clerk's own sign-up is
// also Restricted in the instance (D-038).
const HIDE_SIGN_UP_LINK = { elements: { footerAction: { display: 'none' } } };

/** Clerk's own sign-in (brief section 6.1), with no route to sign up. */
export function SignInPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <SignIn routing="hash" appearance={HIDE_SIGN_UP_LINK} />
    </main>
  );
}
