import { createContext } from 'react';
import type { MeResponse } from '../../../shared/core/me-response';

export type ActiveSession = Extract<MeResponse, { status: 'active' }>;

export const ActiveSessionContext = createContext<ActiveSession | null>(null);
