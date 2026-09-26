import type {
  FiledLetterRecord,
  LetterDirection,
} from '../../../shared/resources-library/filed-letter';
import type {
  LetterTemplateRecord,
  LetterTemplatesView,
} from '../../../shared/resources-library/letter-template';
import type { useApiRequest } from '../../app/api/use-api-request';

type Request = ReturnType<typeof useApiRequest>;

const unitPath = (unitId: string) => `/api/resources-library/units/${unitId}`;

export type LetterTemplateDraft = Pick<
  LetterTemplateRecord,
  'title' | 'subject' | 'body' | 'fields' | 'language'
>;

export function fetchLetterTemplates(request: Request, unitId: string) {
  return request<LetterTemplatesView>(`${unitPath(unitId)}/letter-templates`);
}

export function createLetterTemplate(request: Request, unitId: string, draft: LetterTemplateDraft) {
  return request<{ id: string }>(`${unitPath(unitId)}/letter-templates`, {
    method: 'POST',
    body: draft,
  });
}

export function saveLetterTemplate(
  request: Request,
  unitId: string,
  p: { templateId: string; version: number; template: LetterTemplateDraft },
) {
  return request<undefined>(`${unitPath(unitId)}/letter-templates/${p.templateId}`, {
    method: 'PUT',
    body: { version: p.version, template: p.template },
  });
}

export function setTemplateRetired(
  request: Request,
  unitId: string,
  p: { templateId: string; version: number; retire: boolean },
) {
  const action = p.retire ? 'retire' : 'restore';
  return request<undefined>(`${unitPath(unitId)}/letter-templates/${p.templateId}/${action}`, {
    method: 'POST',
    body: { version: p.version },
  });
}

export function fetchFiledLetters(request: Request, unitId: string, direction: LetterDirection) {
  return request<FiledLetterRecord[]>(`${unitPath(unitId)}/letters/${direction}`);
}

export function filedLetterFilePath(unitId: string, direction: LetterDirection, letterId: string) {
  return `${unitPath(unitId)}/letters/${direction}/${letterId}/file`;
}
