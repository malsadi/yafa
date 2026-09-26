/**
 * D-135: the fictional officers the end-to-end journeys sign in as (brief
 * 27), in the Clerk development instance only. Clearly fake names, and
 * example.com addresses with Clerk's `+clerk_test` marker, and Clerk's
 * reserved test phone numbers (+1 555-0100 to 0199, set aside for fiction):
 * a development instance never sends email or texts to those, and signs
 * them in with its test code, so no real person is ever contacted (D-062).
 */
export const TEST_OFFICERS = [
  {
    key: 'treasurer',
    firstName: 'Fictional',
    lastName: 'Treasurer (test)',
    email: 'e2e.treasurer+clerk_test@example.com',
    phone: '+15555550100',
  },
  {
    key: 'approver',
    firstName: 'Fictional',
    lastName: 'Approver (test)',
    email: 'e2e.approver+clerk_test@example.com',
    phone: '+15555550101',
  },
  {
    key: 'administrator',
    firstName: 'Fictional',
    lastName: 'Administrator (test)',
    email: 'e2e.administrator+clerk_test@example.com',
    phone: '+15555550102',
  },
  {
    key: 'officer',
    firstName: 'Fictional',
    lastName: 'Officer (test)',
    email: 'e2e.officer+clerk_test@example.com',
    phone: '+15555550103',
  },
] as const;
