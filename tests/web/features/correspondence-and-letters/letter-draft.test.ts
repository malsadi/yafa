import { describe, expect, it } from 'vitest';
import type { WritingChoices } from '../../../../src/shared/correspondence-and-letters/letter-records';
import {
  draftSubject,
  emptyDraft,
  generateBody,
  previewLetterhead,
} from '../../../../src/web/features/correspondence-and-letters/letter-draft';

const TEMPLATE = {
  id: 't1',
  national: false,
  title: 'Venue thanks',
  subject: 'Thank you, {{venue}}',
  body: 'Dear {{contact}},\n\nThank you.',
  fields: ['venue', 'contact'],
  language: 'en' as const,
};
const CHOICES: WritingChoices = {
  templates: [TEMPLATE],
  signerRoles: [{ roleId: 'r1', nameEn: 'Secretary', nameAr: 'أمين السر' }],
  signerName: 'Fictional Writer',
  letterheadUnit: { nameEn: 'North', nameAr: 'الشمال', addressEn: null, addressAr: null },
  answerable: [
    { id: 'in1', referenceNumber: 'N/IN/2026/001', sender: 'S', subject: 'Q', status: 'Received' },
  ],
};

describe('writing a letter on screen (brief 23 A2; D-214)', () => {
  it('starts empty, signing with the writer’s only role, and answering only a letter that can be answered', () => {
    expect(emptyDraft(CHOICES, 'in1')).toMatchObject({
      signerRoleId: 'r1',
      replyToLetterInId: 'in1',
    });
    expect(emptyDraft(CHOICES, 'not-answerable').replyToLetterInId).toBe('');
    expect(
      emptyDraft(
        {
          ...CHOICES,
          signerRoles: [
            ...CHOICES.signerRoles,
            { roleId: 'r2', nameEn: 'Chair', nameAr: 'الرئيس' },
          ],
        },
        null,
      ).signerRoleId,
    ).toBe('');
  });

  it('keeps the register subject following the template’s until the writer types their own (O-139)', () => {
    const draft = {
      ...emptyDraft(CHOICES, null),
      templateId: 't1',
      fieldValues: { venue: 'The Hall' },
    };
    expect(draftSubject(draft, TEMPLATE)).toBe('Thank you, The Hall');
    expect(draftSubject({ ...draft, subject: 'My own' }, TEMPLATE)).toBe('My own');
  });

  it('sends an empty address and no reply as none', () => {
    const draft = { ...emptyDraft(CHOICES, null), templateId: 't1', recipientAddress: '  ' };
    expect(generateBody(draft, TEMPLATE)).toMatchObject({
      recipientAddress: null,
      replyToLetterInId: null,
      subject: 'Thank you, ',
    });
  });

  it('previews on the letterhead with the reference still to come, signed by the writer', () => {
    const draft = { ...emptyDraft(CHOICES, null), templateId: 't1', recipientName: 'Ms Example' };
    const branding = {
      organisationName: { en: 'Example Council', ar: null },
      mainColour: '#1D4ED8',
      accentColour: '#B91C1C',
      logoPosition: 'left' as const,
      files: {
        logo: true,
        'icon-192': true,
        'icon-512': true,
        'latin-font': true,
        'arabic-font': true,
      },
      letterheadUnit: null,
    };
    const input = previewLetterhead(draft, CHOICES, branding);
    expect(input?.letter.heading?.reference).toBe(
      'Our reference: [given when the letter is generated]',
    );
    expect(input?.letter.heading?.recipient).toEqual(['Ms Example']);
    expect(input?.letter.signer).toEqual({
      name: 'Fictional Writer',
      role: 'Secretary',
      unit: 'North',
    });
    expect(previewLetterhead({ ...draft, templateId: '' }, CHOICES, branding)).toBeNull();
  });
});
