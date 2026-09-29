/** Brief 25 C3: the branding and letterhead screen. */
export const brandingText = {
  intro:
    'The organisation name, and the main and accent colours used for headings, rules and accents on the portal and in its documents. Text stays black on white.',
  nameEn: 'Organisation name in English',
  nameAr: 'Organisation name in Arabic',
  mainColour: 'Main colour',
  accentColour: 'Accent colour',
  sampleHeading: 'Heading',
  contrastOk: '{ratio}:1 against white: reads well',
  contrastTooLow: '{ratio}:1 against white: too pale to read (needs 4.5:1)',
  pickColour: 'Pick the {colour}',
  colourFormat: 'Type it as # and six letters or digits, for example #1D4ED8.',
  saveNeedsColours: 'Save becomes available once both colours are set and read well on white.',
  save: 'Save',
  logoPosition: 'Logo position on the letterhead',
  logoPositionHint: 'In Arabic letters it is mirrored: left becomes the start of the line.',
  positions: { left: 'Left', centre: 'Centre', right: 'Right' },
  letterhead: 'Letterhead',
  previewIn: { en: 'In English', ar: 'In Arabic' },
  previewPdf: 'Preview PDF',
  sample: {
    paragraphs:
      'Dear colleague,\n\nThis is how a letter from the portal looks on the letterhead.\n\nWith best wishes,',
    signer: { name: 'The signing officer', role: 'Their role', unit: 'Their unit' },
  },
  refusals: {
    'permission.denied': 'You may not change the branding.',
    'pdf.not-available': 'PDF previews are not available here. They work on the preview site.',
    'branding.no-national-unit': 'The General Council unit does not exist yet.',
    'request.invalid':
      'Check what you entered: the English name is needed, and each colour must read on white.',
  },
};
