import type { ServiceSlug } from '../core/services';

/** Brief 25 D2 and D-217 (O-167): one recorded action, as the audit log shows it. */
export interface AuditEntry {
  id: string;
  occurredAt: string;
  actorPersonId: string;
  actorName: string | null;
  action: string;
  service: ServiceSlug | null;
  entityType: string;
  entityId: string;
  /** Shown only for the Administration panel's own changes (P22); otherwise null. */
  before: string | null;
  after: string | null;
}

/** What the audit log can be searched by: person, service, record and dates (London days). */
export interface AuditSearch {
  personId?: string;
  service?: ServiceSlug;
  entityType?: string;
  entityId?: string;
  from?: string;
  to?: string;
}

/** A page of the audit log, and everyone who appears in it, to filter by (25 D2). */
export interface AuditLogPage {
  items: AuditEntry[];
  page: number;
  pageCount: number;
  actors: { personId: string; name: string | null }[];
}
