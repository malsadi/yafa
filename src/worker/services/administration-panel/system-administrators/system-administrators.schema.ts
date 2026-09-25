import { z } from 'zod';

export const appointSystemAdministratorSchema = z.object({ personId: z.string().min(1) });

export type {
  SystemAdministratorCandidate,
  SystemAdministratorListItem,
} from '../../../../shared/administration-panel/system-administrators';
