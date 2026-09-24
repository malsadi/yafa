// Wrangler's "Data" module rule (tests/pdf-remote/wrangler.jsonc) imports a
// font file as its raw bytes.
declare module '*.ttf' {
  const data: ArrayBuffer;
  export default data;
}
