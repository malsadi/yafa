import { beforeEach, describe, expect, it } from 'vitest';
import {
  getCronJobHandler,
  registerCronJob,
  resetCronJobRegistryForTests,
} from '../../src/worker/cron';

describe('job-registry', () => {
  beforeEach(() => {
    resetCronJobRegistryForTests();
  });

  it('registers a job and returns its handler by name', () => {
    const handler = () => Promise.resolve();
    registerCronJob('test.job', handler);

    expect(getCronJobHandler('test.job')).toBe(handler);
  });

  it('returns undefined for a name nothing registered', () => {
    expect(getCronJobHandler('test.nothing')).toBeUndefined();
  });

  it('throws registering the same name twice', () => {
    registerCronJob('test.job', () => Promise.resolve());

    expect(() => {
      registerCronJob('test.job', () => Promise.resolve());
    }).toThrow('Cron job already registered: test.job');
  });
});
