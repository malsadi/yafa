import { parsePoundsToPence, penceToPoundsText } from '../../../shared/core/parse-pounds';
import type { EventTemplateRecord } from '../../../shared/event-organiser/event-records';
import { unitPath } from './event-organiser.api';

/** D-178: a template's form, as typed — amounts in pounds, days as text. */
export interface TemplateDraft {
  name: string;
  tasks: { title: string; description: string; daysBefore: string }[];
  budgetLines: { name: string; amount: string }[];
}

export function templateDraftOf(template?: EventTemplateRecord): TemplateDraft {
  return {
    name: template?.name ?? '',
    tasks: (template?.tasks ?? []).map((t) => ({
      title: t.title,
      description: t.description ?? '',
      daysBefore: String(t.daysBefore),
    })),
    budgetLines: (template?.budgetLines ?? []).map((l) => ({
      name: l.name,
      amount: penceToPoundsText(l.amountPence),
    })),
  };
}

/**
 * D-178 and build rule 3: the template as the portal takes it — days as
 * whole numbers, amounts as whole pence. Null when a number doesn't read.
 */
export function templateBodyOf(draft: TemplateDraft) {
  const days = draft.tasks.map((t) =>
    /^\d+$/.test(t.daysBefore.trim()) ? Number(t.daysBefore) : null,
  );
  const pence = draft.budgetLines.map((l) => parsePoundsToPence(l.amount));
  if (days.includes(null) || pence.includes(null)) return null;
  return {
    name: draft.name,
    tasks: draft.tasks.map((t, i) => ({
      title: t.title,
      description: t.description,
      daysBefore: days[i] ?? 0,
    })),
    budgetLines: draft.budgetLines.map((l, i) => ({ name: l.name, amountPence: pence[i] ?? 0 })),
  };
}

/** A new template, or a change from the version read (9.1). */
export function templateRequest(unitId: string, body: object, template?: EventTemplateRecord) {
  const base = `${unitPath(unitId)}/templates`;
  return template
    ? {
        path: `${base}/${template.id}`,
        method: 'PUT' as const,
        body: { template: body, version: template.version },
      }
    : { path: base, method: 'POST' as const, body };
}
