/** Brief 16 D1, P19 and D-100 to D-102: letter templates in the library. */
export const letterTemplatesText = {
  heading: 'Letter templates',
  none: 'No letter templates yet.',
  national: 'General Council',
  retired: 'Retired',
  languages: { en: 'English', ar: 'Arabic' },
  newTemplate: 'New letter template',
  edit: 'Change',
  retire: 'Retire',
  restore: 'Bring back',
  cancel: 'Cancel',
  save: 'Save',
  saved: 'Saved.',
  title: 'Title',
  subject: 'Subject',
  body: 'Letter text',
  language: 'Language of the letter',
  fields: 'Fields',
  fieldsExplanation:
    'Name each detail to fill in when a letter is written, such as the recipient. Put a field in the subject or text with its button: it appears as its name in double braces.',
  fieldName: 'Field name',
  addField: 'Add field',
  insertField: 'Insert {name}',
  removeField: 'Remove {name}',
  preview: 'Preview on the letterhead',
  previewNotReady:
    'The preview needs the organisation name, colours and logo position set on the Branding screen.',
  sample: {
    logo: 'Logo',
    signer: { name: 'The signing officer', role: 'Their role' },
  },
  refusals: {
    'permission.denied': 'You may not do this.',
    'resources-library.stale':
      'Someone else changed this letter template. Reload it to see their change.',
    'resources-library.letter-template-not-found': 'This letter template no longer exists.',
    'resources-library.already-retired': 'This letter template is already retired.',
    'resources-library.not-retired': 'This letter template is not retired.',
    'branches.inactive': 'This branch is inactive, so its library is read-only.',
    'request.invalid':
      'Check the template: every field used must be in the field list, each named once.',
  },
};
