import { createInterface } from 'node:readline/promises';

/**
 * D-220: nothing is written to production until the owner types the name
 * of what is about to change. Claude Code never runs these commands
 * (CLAUDE.md "Never"); the owner does, and confirms each time.
 */
export function isConfirmed(typed: string, expected: string): boolean {
  return typed.trim() === expected;
}

/** Asks the owner to type `expected`; true only when they typed it exactly. */
export async function confirmProduction(expected: string, action: string): Promise<boolean> {
  const prompt = createInterface({ input: process.stdin, output: process.stdout });
  try {
    const typed = await prompt.question(
      `This will ${action} in PRODUCTION. Type ${expected} to go ahead: `,
    );
    return isConfirmed(typed, expected);
  } finally {
    prompt.close();
  }
}
