import type { UploadTarget } from '../../core/files';
import type { requireLibraryUnit } from './library-access';

type Unit = Awaited<ReturnType<typeof requireLibraryUnit>>;

/** Brief 9.3: where a library file is stored — under its unit and its record. */
export function libraryUploadTarget(unit: Unit, recordId: string): UploadTarget {
  return {
    unitId: unit.id,
    unitCode: unit.code,
    service: 'resources-library',
    recordId,
    use: 'documents',
  };
}
