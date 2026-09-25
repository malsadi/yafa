/** Brief 25 A1: the system administrators screen. */
export const systemAdministratorsText = {
  intro:
    'System administrators are appointed from the General Council and must sign in with a second factor. At least two always remain.',
  appointedOn: 'appointed {date}',
  remove: 'Remove {name}',
  minimumNote: 'At least two system administrators must remain, so none can be removed now.',
  appointHeading: 'Appoint a system administrator',
  officer: 'Officer',
  chooseOfficer: 'Choose an officer',
  appoint: 'Appoint',
  noCandidates: 'No one else holds a current General Council term.',
  refusals: {
    'system-administrators.minimum-two':
      'At least two system administrators must remain, so this one was not removed.',
    'system-administrators.already-appointed': 'This officer is already a system administrator.',
    'system-administrators.needs-general-council-term':
      'Only someone holding a current General Council term can be appointed.',
    'system-administrators.not-found': 'This person is no longer a system administrator.',
  },
};
