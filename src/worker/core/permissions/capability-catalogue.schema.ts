import { z } from 'zod';
import { CAPABILITY_PATTERN } from './route-access.schema';

export type { CapabilityDefinition, FixedGrant } from '../../../shared/core/capability-definition';

export const capabilityNameSchema = z.string().regex(CAPABILITY_PATTERN);
