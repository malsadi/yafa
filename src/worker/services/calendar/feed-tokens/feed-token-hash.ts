const BYTES = 32;

/** Brief 6.4: a long random feed token, as it goes in the feed's address. */
export function newFeedToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(BYTES));
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/** Brief 6.4: a token is stored only as its SHA-256 hash, hex. */
export async function hashFeedToken(token: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}
