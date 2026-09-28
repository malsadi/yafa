import type { ServiceSlug } from '../../../shared/core/services';

/**
 * Brief section 8.4 states one dependency between stage-one services
 * (D-049). D-186 adds the Task tracker: the Event organiser can't work
 * without either. The Calendar and Communication hub are only publishing
 * targets, skipped while off (D-182). D-214 adds Correspondence, which
 * needs the Resources library (O-147). No others are invented; a phase that
 * finds a real one raises it with the owner first.
 */
export const SERVICE_DEPENDENCIES: Partial<Record<ServiceSlug, readonly ServiceSlug[]>> = {
  'event-organiser': ['treasury', 'task-tracker'],
  // D-214 (O-147): letters are written from the library's templates and filed there.
  'correspondence-and-letters': ['resources-library'],
};
