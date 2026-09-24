import { Show } from '@clerk/react';
import { SignInPage } from '../pages/sign-in-page';
import { SignedInShell } from './signed-in-shell';

/** Signed out: Clerk's sign-in. Signed in: whatever the session allows. */
export function SessionShell() {
  return (
    <>
      <Show when="signed-out">
        <SignInPage />
      </Show>
      <Show when="signed-in">
        <SignedInShell />
      </Show>
    </>
  );
}
