import type { TextShape } from '../text-shape';
import type { documentsArchiveText as english } from '../en/documents-archive';

export const documentsArchiveText: TextShape<typeof english> = {
  name: 'أرشيف الوثائق',
  capabilities: {
    'documents-archive.documents.read': 'الاطلاع على الأرشيف',
    'documents-archive.documents.upload': 'الرفع إلى الأرشيف',
  },
};
