import type { Language } from './languages';
import type { ServiceSlug } from './services';

export interface MeUnit {
  id: string;
  type: 'national' | 'branch';
  nameEn: string;
  nameAr: string;
  enabledServices: ServiceSlug[];
}

/**
 * `GET /api/me` (T-067), shared by the Worker that builds it and the web app
 * that reads it. `capabilities` is a UI hint only (T-042); the server
 * decides every request with `can()`.
 */
export type MeResponse =
  | { status: 'not-active' }
  | { status: 'second-factor-required'; language: Language | null }
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
      /** Brief 9.3: photos are resized on the device to fit this; null while not set (8.1). */
      photoMaxDimensionPx: number | null;
    };
