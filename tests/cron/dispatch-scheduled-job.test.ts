import { env } from 'cloudflare:workers';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  dispatchScheduledJob,
  registerCronJob,
  resetCronJobRegistryForTests,
} from '../../src/worker/cron';

async function readJobRun(
  jobName: string,
): Promise<{ outcome: string; error_code: string | null } | null> {
  return env.DB.prepare('SELECT outcome, error_code FROM job_runs WHERE job_name = ?')
    .bind(jobName)
    .first<{ outcome: string; error_code: string | null }>();
}

describe('dispatchScheduledJob', () => {
  beforeEach(() => {
    resetCronJobRegistryForTests();
  });

  it('throws for an unregistered job, and records nothing', async () => {
    await expect(dispatchScheduledJob('test.unregistered', env)).rejects.toThrow(
      'Cron job is not registered: test.unregistered',
    );

    expect(await readJobRun('test.unregistered')).toBeNull();
  });

  it('runs the handler and records success', async () => {
    let calledWithEnv: typeof env | undefined;
    registerCronJob('test.succeeds', (jobEnv) => {
      calledWithEnv = jobEnv as typeof env;
      return Promise.resolve();
    });

    await dispatchScheduledJob('test.succeeds', env);

    expect(calledWithEnv).toBe(env);
    expect(await readJobRun('test.succeeds')).toEqual({ outcome: 'success', error_code: null });
  });

  it("re-throws the handler's error and records failure with its name", async () => {
    registerCronJob('test.fails', () => Promise.reject(new RangeError('boom')));

    await expect(dispatchScheduledJob('test.fails', env)).rejects.toThrow('boom');

    expect(await readJobRun('test.fails')).toEqual({
      outcome: 'failure',
      error_code: 'RangeError',
    });
  });

  it('upserts the same row across repeated runs, never inserting a second one', async () => {
    registerCronJob('test.repeats', () => Promise.resolve());

    await dispatchScheduledJob('test.repeats', env);
    await dispatchScheduledJob('test.repeats', env);

    const rows = await env.DB.prepare('SELECT COUNT(*) AS count FROM job_runs WHERE job_name = ?')
      .bind('test.repeats')
      .first<{ count: number }>();
    expect(rows?.count).toBe(1);
  });
});
