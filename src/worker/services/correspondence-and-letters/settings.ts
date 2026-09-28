import { z } from 'zod';
import { isValidReferenceFormat } from '../../../shared/correspondence-and-letters/reference-format';
import { registerSetting } from '../../core/settings';

const format = z.string().refine(isValidReferenceFormat, {
  message: 'A format with one {number} and a {year}.',
});

/**
 * Service 7's settings (brief 23; 8.1: no default in code): the reference
 * number formats for letters out and letters in. Portal-wide (D-214,
 * O-136); each must hold one number and the year (O-137). Both are required
 * before Correspondence is switched on.
 */
export function registerCorrespondenceAndLettersSettings(): void {
  registerSetting({
    key: 'correspondence-and-letters.reference_format_out',
    label: 'Reference number format: letters out',
    description:
      'How a letter out is numbered, from {unit_code}, {year} and {number} (or {number:3} for at least three digits) (23 B1; D-214).',
    schema: format,
    input: { kind: 'reference-format' },
    required: true,
    unitOverrideAllowed: false,
  });
  registerSetting({
    key: 'correspondence-and-letters.reference_format_in',
    label: 'Reference number format: letters in',
    description:
      'How a letter in is numbered, from {unit_code}, {year} and {number} (or {number:3} for at least three digits) (23 B1; D-214).',
    schema: format,
    input: { kind: 'reference-format' },
    required: true,
    unitOverrideAllowed: false,
  });
}
