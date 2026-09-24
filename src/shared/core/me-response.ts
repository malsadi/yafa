import type { Language } from './languages';
import type { ServiceSlug } from './services';

export interface MeUnit {
  id: string;
  type: 'national' | 'branch';
  name: string;
  enabledServices: ServiceSlug[];
}

/**
 * `GET /api/me` (T-067), shared by the Worker that builds it and the web app
 * that reads it. `capabilities` is a UI hint only (T-042); the server
 * decides every request with `can()`.
 */
export type MeResponse =
  | { status: 'not-active' }
  | { status: 'notice-not-set'; language: Language | null }
  | { status: 'notice-not-acknowledged'; language: Language | null; noticeVersionId: string }
  | {
      status: 'active';
      language: Language | null;
      context: {
        personId: string;
        units: readonly string[];
        roles: readonly string[];
        capabilities: readonly string[];
        isSystemAdmin: boolean;
      };
      units: MeUnit[];
      maintenanceMode: boolean;
    };
