// Brief 9.3 and 12: the R2 S3 credentials the upload and download links are
// signed with. Secrets set with `wrangler secret put` by the owner; until
// they are, file uploads and links answer "storage not configured". Added to
// both Env types `wrangler types` generates.
declare global {
  interface Env {
    R2_ACCOUNT_ID?: string;
    R2_ACCESS_KEY_ID?: string;
    R2_SECRET_ACCESS_KEY?: string;
  }
  namespace Cloudflare {
    interface Env {
      R2_ACCOUNT_ID?: string;
      R2_ACCESS_KEY_ID?: string;
      R2_SECRET_ACCESS_KEY?: string;
    }
  }
}

export {};
