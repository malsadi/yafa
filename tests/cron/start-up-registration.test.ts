import { beforeEach, describe, expect, it } from 'vitest';
import {
  getCronJobHandler,
  registerCronJob,
  registerCronJobs,
  resetCronJobRegistryForTests,
} from '../../src/worker/cron';
import { registerQueueConsumers } from '../../src/worker/queues/register-queue-consumers';
import {
  getQueueConsumerHandler,
  resetQueueConsumerRegistryForTests,
} from '../../src/worker/queues/consumer-registry';

// T-150: Vite's dev server can run the Worker's entry file again in the same
// process; its start-up registration must then do nothing, while a real
// second registration of one job or consumer is still refused.
describe('start-up registration of scheduled jobs and queue consumers', () => {
  beforeEach(() => {
    resetCronJobRegistryForTests();
    resetQueueConsumerRegistryForTests();
  });

  it('registers each job and consumer once, however often the entry file runs', () => {
    registerCronJobs();
    registerQueueConsumers();
    expect(() => {
      registerCronJobs();
      registerQueueConsumers();
    }).not.toThrow();
    expect(getCronJobHandler('close-votes')).toBeDefined();
    expect(getQueueConsumerHandler('notifications')).toBeDefined();
  });

  it('still refuses a second handler for the same job', () => {
    registerCronJobs();
    expect(() => {
      registerCronJob('close-votes', () => Promise.resolve());
    }).toThrow('Cron job already registered: close-votes');
  });
});
