import { env } from 'cloudflare:workers';
import { beforeAll, describe, expect, it } from 'vitest';
import type { AnnualReportDocument } from '../../../src/pdf-templates/annual-report/annual-report-document';
import type { AnnualReportRecord } from '../../../src/shared/achievements-and-reports/annual-report';
import { setSetting } from '../../../src/worker/core/settings';
import { finaliseReport } from '../../../src/worker/services/achievements-and-reports';
import { insertNoticeVersion } from '../../app/app-fixtures';
import {
  achievementBody,
  achievementOfficer,
  addCategory,
  call,
  MANAGE,
  READ,
  readyAchievements,
  RECORD,
  switchService,
  thisYear,
  unitPath,
  type Officer,
} from '../../api/achievements-and-reports/achievement-fixtures';
import { contextOf, nameOrganisation, storage } from '../treasury/treasury-service-fixtures';

const NOTICE = '01ARZ3NDEKTSV4RRFFQ69ARNTV';
const CATEGORY = 'cat-AR-service';
let officer: Officer;
let reportId = '';
const last = () => thisYear() - 1;
const reports = () => `${unitPath(officer.unitId)}/annual-reports`;
const read = async () =>
  (await call(officer.clerkUserId, 'GET', `${reports()}/${reportId}`)).json<AnnualReportRecord>();
const rendered: AnnualReportDocument[] = [];
const render = (document: AnnualReportDocument) => {
  rendered.push(document);
  return Promise.resolve(new TextEncoder().encode(`%PDF ${document.title}`));
};

/** An event in a given state, and its move to Completed in the audit log at `completedAt` (P17). */
async function addEvent(p: {
  id: string;
  status: string;
  completedAt: string | null;
  cancelled?: boolean;
}) {
  const at = `${String(last())}-01-01T00:00:00.000Z`;
  await env.DB.prepare(
    `INSERT INTO events (id, unit_id, name, type_item_id, lead_person_id, first_day, status, cancelled_at, cancel_reason, version, created_by, created_at, updated_by, updated_at)
     VALUES (?, ?, ?, 'et-AR', ?, ?, ?, ?, ?, 1, 'test', ?, 'test', ?)`,
  )
    .bind(
      p.id,
      officer.unitId,
      `Event ${p.id}`,
      officer.personId,
      `${String(last())}-03-01`,
      p.status,
      p.cancelled ? at : null,
      p.cancelled ? 'Rain' : null,
      at,
      at,
    )
    .run();
  if (p.completedAt)
    await env.DB.prepare(
      `INSERT INTO audit_log (id, actor_person_id, action, entity_type, entity_id, occurred_at, before, after)
       VALUES (?, 'test', 'event.status-moved', 'event', ?, ?, '{"status":"Published"}', '{"status":"Completed"}')`,
    )
      .bind(`audit-${p.id}`, p.id, p.completedAt)
      .run();
}

async function addMeeting(id: string, date: string, status: string) {
  await env.DB.prepare(
    `INSERT INTO meetings (id, unit_id, type_item_id, date, start_time, place, online_link, chair_person_id, secretary_person_id, status, version, created_by, created_at, updated_by, updated_at)
     VALUES (?, ?, 'mt-AR', ?, '19:00', 'Hall', NULL, ?, ?, ?, 1, 'test', 'now', 'test', 'now')`,
  )
    .bind(id, officer.unitId, date, officer.personId, officer.personId, status)
    .run();
}

describe('the annual report (brief 24 B2; P17, P18; D-215)', () => {
  beforeAll(async () => {
    await insertNoticeVersion(NOTICE, '2026-01-01T00:00:00.000Z');
    officer = await achievementOfficer({
      suffix: 'AR1',
      notice: NOTICE,
      capabilities: [READ, RECORD, MANAGE],
    });
    await readyAchievements(officer.unitId, officer.personId);
    for (const service of ['event-organiser', 'meeting-recorder', 'treasury'])
      await switchService(service, officer.unitId, true);
    await setSetting(env.DB, {
      key: 'treasury.financial_year_start',
      value: { month: 1, day: 1 },
      actorPersonId: officer.personId,
    });
    await nameOrganisation(officer.personId);
    for (const [key, value] of [
      ['administration-panel.download_link_threshold_mb', 1],
      ['administration-panel.download_link_lifetime_minutes', 5],
    ] as const)
      await setSetting(env.DB, { key, value, actorPersonId: officer.personId });
    await addCategory(CATEGORY, 'Service');
    await env.DB.prepare(
      "INSERT INTO list_items (id, list, name_en, name_ar, position, retired_at, colour, created_at) VALUES ('mt-AR', 'meeting-types', 'Committee', 'اللجنة', 1, NULL, NULL, 'now'), ('et-AR', 'event-types', 'Fair', 'مهرجان', 1, NULL, NULL, 'now')",
    ).run();
    for (const date of [`${String(last())}-06-01`, `${String(thisYear())}-01-01`])
      await call(
        officer.clerkUserId,
        'POST',
        `${unitPath(officer.unitId)}/achievements`,
        achievementBody({
          categoryItemId: CATEGORY,
          officers: [officer.personId],
          date,
          title: `Award ${date}`,
        }),
      );
    await addEvent({
      id: 'ev-done',
      status: 'Closed',
      completedAt: `${String(last())}-05-01T10:00:00.000Z`,
    });
    await addEvent({ id: 'ev-cancelled', status: 'Closed', completedAt: null, cancelled: true });
    await addEvent({
      id: 'ev-next',
      status: 'Completed',
      completedAt: `${String(thisYear())}-01-05T10:00:00.000Z`,
    });
    await addMeeting('m-held', `${String(last())}-04-01`, 'Held');
    await addMeeting('m-planned', `${String(last())}-04-02`, 'Scheduled');
  });

  it('starts once the year has ended, one per year (O-157)', async () => {
    const start = (year: number) => call(officer.clerkUserId, 'POST', reports(), { year });
    expect(await (await start(thisYear())).json()).toEqual({
      error: { code: 'achievements-and-reports.year-not-ended' },
    });
    const res = await start(last());
    expect(res.status).toBe(201);
    reportId = (await res.json<{ id: string }>()).id;
    expect(await (await start(last())).json()).toEqual({
      error: { code: 'achievements-and-reports.already-started' },
    });
  });

  it('brings together the year’s achievements, events completed (P17), meetings held and a provisional Treasury year (P18)', async () => {
    const { content, status } = await read();
    expect(status).toBe('Draft');
    expect(content.achievements.map((a) => a.title)).toEqual([`Award ${String(last())}-06-01`]);
    expect(content.events).toEqual([
      { name: 'Event ev-done', completedOn: `${String(last())}-05-01` },
    ]);
    expect(content.meetings).toEqual([
      { typeNameEn: 'Committee', typeNameAr: 'اللجنة', date: `${String(last())}-04-01` },
    ]);
    expect(content.treasury).toMatchObject({ start: `${String(last())}-01-01`, closed: false });
    expect(content.officers.map((o) => o.roleNameEn)).toEqual(['Role AR1']);
  });

  it('says a section’s service is not in use when it is switched off (O-160)', async () => {
    await switchService('meeting-recorder', officer.unitId, false);
    expect((await read()).content.meetings).toBeNull();
    await switchService('meeting-recorder', officer.unitId, true);
  });

  it('keeps the branch’s summary from the version read (O-157; 9.1)', async () => {
    const save = (version: number) =>
      call(officer.clerkUserId, 'PUT', `${reports()}/${reportId}/summary`, {
        summary: 'A good year.',
        version,
      });
    expect((await save(1)).status).toBe(204);
    expect(await (await save(1)).json()).toEqual({
      error: { code: 'achievements-and-reports.stale' },
    });
  });

  it('finalises: frozen, filed to Annual reports, and its year’s achievements locked (O-158)', async () => {
    await finaliseReport(
      env.DB,
      contextOf(officer),
      { storage, render },
      { unitId: officer.unitId, reportId, version: 2, language: 'en' },
    );
    const report = await read();
    expect(report.status).toBe('Finalised');
    expect(report.content.summary).toBe('A good year.');
    expect(rendered.at(-1)?.sections.find((s) => s.heading === 'Treasury')?.lines[0]).toBe(
      'Provisional: the financial year is not yet closed.',
    );
    const filed = await env.DB.prepare(
      'SELECT d.category_id AS category, f.locked FROM archive_documents d JOIN archive_document_versions v ON v.document_id = d.id JOIN files f ON f.id = v.file_id WHERE d.source_record_id = ?',
    )
      .bind(reportId)
      .all();
    expect(filed.results).toEqual([{ category: 'annual-reports', locked: 1 }]);
    const late = await call(
      officer.clerkUserId,
      'POST',
      `${unitPath(officer.unitId)}/achievements`,
      achievementBody({
        categoryItemId: CATEGORY,
        officers: [officer.personId],
        date: `${String(last())}-07-01`,
      }),
    );
    expect(await late.json()).toEqual({ error: { code: 'achievements-and-reports.locked' } });
    expect((await call(officer.clerkUserId, 'GET', `${reports()}/${reportId}/file`)).status).toBe(
      200,
    );
  });

  it('is never changed, reopened or deleted once finalised, in the database', async () => {
    for (const sql of [
      "UPDATE annual_reports SET summary = 'Changed', version = version + 1",
      "UPDATE annual_reports SET status = 'Draft', version = version + 1",
      'DELETE FROM annual_reports',
      `UPDATE achievements SET title = 'Changed', version = version + 1 WHERE achievement_date LIKE '${String(last())}%'`,
    ])
      await expect(env.DB.prepare(sql).run()).rejects.toThrow();
  });
});
