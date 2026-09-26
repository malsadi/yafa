/** Brief 20 C1 and 15 C4: what a device needs to receive phone alerts. */
export interface PushSetup {
  /** The portal's public push key; null while push is not set up (D-165). */
  publicKey: string | null;
  /** D-086: the iPhone install guide, in both languages; null until the administrator writes it. */
  installGuide: { textEn: string; textAr: string | null } | null;
}
