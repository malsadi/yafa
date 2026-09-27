import { z } from 'zod';
import {
  ATTENDANCE_MARKS,
  type Attendance,
} from '../../../../shared/meeting-recorder/meeting-statuses';

/** Brief 22 A2: officers added to the meeting's attendees. */
export const addAttendeesSchema = z.object({ personIds: z.array(z.string().min(1)).min(1) });

/** D-203: present, sending apologies, or did not attend. */
export const attendanceSchema = z.object({
  attendance: z.enum(ATTENDANCE_MARKS as [Attendance, ...Attendance[]]),
});
