export const meetingRecorderText = {
  name: 'Meeting recorder',
  capabilities: {
    'meeting-recorder.meetings.read': 'See meetings',
    'meeting-recorder.meetings.manage': 'Manage meetings',
  },
  settings: {
    'meeting-recorder.minutes_autosave_seconds': 'Minutes autosave interval (seconds)',
  },
  statuses: {
    Scheduled: 'Scheduled',
    Held: 'Held',
    'Report logged': 'Report logged',
    Cancelled: 'Cancelled',
  },
  attendance: {
    Present: 'Present',
    Apologies: 'Apologies',
    'Did not attend': 'Did not attend',
  },
  reportPdf: {
    title: 'Meeting report: {type}',
    when: 'Date: {date}, {time}',
    place: 'Place: {place}',
    link: 'Online: {link}',
    chair: 'Chair: {name}',
    secretary: 'Secretary: {name}',
    attendance: 'Attendance',
    notMarked: 'Not marked',
    originalAgenda: 'Agenda',
    updatedAgenda: 'Agenda as updated in the meeting',
    raised: '{title} (raised in meeting)',
    minutes: 'Minutes',
    vote: 'Vote: {for} for, {against} against, {abstain} abstaining. Result: {result}',
    decision: 'Decision: {decision}',
  },
};
