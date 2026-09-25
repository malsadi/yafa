import type { ServiceSlug } from '../core/services';
import type { SettingInput } from './setting-input';

/** Brief 25 C1: one registered setting, with its national value and any unit overrides. */
export interface ServiceSettingView {
  key: string;
  service: ServiceSlug;
  required: boolean;
  unitOverrideAllowed: boolean;
  input: SettingInput;
  /** Null while not configured (brief 8.1: no value in code). */
  national: unknown;
  overrides: { unitId: string; value: unknown }[];
}

/** A unit or role named in both languages, as the screen needs them. */
export interface NamedChoice {
  id: string;
  nameEn: string;
  nameAr: string;
}

export interface ServiceSettingsView {
  settings: ServiceSettingView[];
  /** The units an override may be set for. */
  units: NamedChoice[];
  /** The standard roles, for a setting entered as roles. */
  roles: NamedChoice[];
}

/** Brief 8.1: one change, with who and when; a removed override has no new value. */
export interface SettingHistoryEntry {
  id: string;
  scope: string;
  previousValue: unknown;
  newValue: unknown;
  changedAt: string;
  changedByName: string;
}
