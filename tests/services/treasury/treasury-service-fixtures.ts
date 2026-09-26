import { env } from 'cloudflare:workers';
import type { StatementDocument } from '../../../src/pdf-templates/treasury-statement/statement-document';
import type { RequestContext } from '../../../src/worker/core/permissions';
import { setSetting } from '../../../src/worker/core/settings';
import type { Officer } from '../../api/treasury/treasury-fixtures';

/** The officer's request context, as the middleware builds it; `can()` checks the database itself. */
export function contextOf(officer: Officer): RequestContext {
  return {
    personId: officer.personId,
    units: [officer.unitId],
    roles: [],
    capabilities: [],
    isSystemAdmin: false,
  };
}

/** A stand-in for Browser Rendering: records each statement it is given, and returns fixed bytes. */
export function fakeRenderer() {
  const rendered: StatementDocument[] = [];
  return {
    rendered,
    render: (document: StatementDocument) => {
      rendered.push(document);
      return Promise.resolve(new TextEncoder().encode(`%PDF ${document.title}`));
    },
  };
}

export const storage = {
  bucket: env.FILES,
  access: () => ({
    accountId: 'fictional',
    jurisdiction: 'eu',
    bucket: 'b',
    accessKeyId: 'id',
    secretAccessKey: 's',
  }),
};

/** The organisation's name, which a statement is headed with (25 C3). */
export async function nameOrganisation(actor: string): Promise<void> {
  await setSetting(env.DB, {
    key: 'administration-panel.organisation_name',
    value: { en: 'Example Council', ar: 'مجلس تجريبي' },
    actorPersonId: actor,
  });
}
