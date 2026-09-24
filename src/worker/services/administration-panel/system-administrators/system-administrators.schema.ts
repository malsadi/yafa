import { z } from 'zod';

export const appointSystemAdministratorSchema = z.object({ personId: z.string().min(1) });

export interface SystemAdministratorListItem {
  personId: string;
  email: string;
  appointedAt: string;
}
