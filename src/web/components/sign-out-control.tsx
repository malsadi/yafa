import { SignOutButton } from '@clerk/react';
import { useText } from '../app/language/use-text';

export function SignOutControl() {
  const text = useText();
  return (
    <SignOutButton>
      <button type="button" className="rounded border px-3 py-2">
        {text.portalShell.signOut}
      </button>
    </SignOutButton>
  );
}
