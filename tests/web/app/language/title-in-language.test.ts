import { describe, expect, it } from 'vitest';
import { titleInLanguage } from '../../../../src/web/app/language/title-in-language';

describe("a meeting's title in the reader's language (D-211)", () => {
  const meeting = { title: 'Committee meeting', titleAr: 'اجتماع اللجنة' };
  const event = { title: 'Summer fair', titleAr: null };

  it("gives the meeting type's name in the reader's language", () => {
    expect(titleInLanguage(meeting, 'en')).toBe('Committee meeting');
    expect(titleInLanguage(meeting, 'ar')).toBe('اجتماع اللجنة');
  });

  it("gives an event's one name to everyone", () => {
    expect(titleInLanguage(event, 'ar')).toBe('Summer fair');
  });
});
