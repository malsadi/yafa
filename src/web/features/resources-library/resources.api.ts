import type { Language } from '../../../shared/core/languages';
import type { ResourceKind, ResourceRecord } from '../../../shared/resources-library/resource';
import type { useApiRequest } from '../../app/api/use-api-request';
import { uploadFile } from '../../app/files/upload-file';

type Request = ReturnType<typeof useApiRequest>;

export const resourcesPath = (unitId: string) => `/api/resources-library/units/${unitId}/resources`;

/** D-103: a template's or guide's details as written in a form. */
export interface ResourceDetailsDraft {
  title: string;
  description: string;
  language: Language;
}

const fileOf = (file: File) => ({ body: file, fileName: file.name, contentType: file.type });

export function fetchResources(request: Request, unitId: string) {
  return request<ResourceRecord[]>(resourcesPath(unitId));
}

export function addResource(
  request: Request,
  unitId: string,
  p: { kind: ResourceKind; file: File; details: ResourceDetailsDraft },
) {
  const base = resourcesPath(unitId);
  return uploadFile(
    request,
    { start: `${base}/uploads`, complete: (started) => `${base}/${String(started.resourceId)}` },
    fileOf(p.file),
    { kind: p.kind, ...p.details },
  );
}

export function changeResourceDetails(
  request: Request,
  unitId: string,
  p: { resourceId: string; version: number; details: ResourceDetailsDraft },
) {
  return request<undefined>(`${resourcesPath(unitId)}/${p.resourceId}`, {
    method: 'PATCH',
    body: { version: p.version, details: p.details },
  });
}

/** D-104: the new file is shown from now on; the old one is kept. */
export function replaceResourceFile(
  request: Request,
  unitId: string,
  p: { resourceId: string; version: number; file: File },
) {
  const one = `${resourcesPath(unitId)}/${p.resourceId}`;
  return uploadFile(
    request,
    { start: `${one}/file/uploads`, complete: `${one}/file` },
    fileOf(p.file),
    {
      version: p.version,
    },
  );
}
