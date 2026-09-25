/** Brief 25 C2: the service switches screen. */
export const serviceSwitchesText = {
  intro:
    'Turn each service on or off for the whole portal, or give a unit its own on or off. A service switched off is hidden and its data is kept. A service can be switched on only once its set-up is complete.',
  portalWide: 'Portal-wide',
  portalWideOf: '{service}, portal-wide',
  unitOf: '{service} for {unit}',
  addUnit: 'Give a unit its own on or off',
  addUnitOf: 'Give a unit its own on or off for {service}',
  chooseUnit: 'Choose a unit',
  on: 'On',
  off: 'Off',
  follow: 'Follow portal-wide',
  alwaysOn: 'Always on: this service cannot be switched off.',
  needs: 'Needs: {services}',
  refusals: {
    'service-switches.needs-service':
      'This service needs another that is off there. Switch that one on first.',
    'service-switches.needed-by-service':
      'Another service that is on there needs this one. Switch that one off first.',
    'service-switches.setup-incomplete':
      'Its set-up is not complete there: see the set-up checklist.',
    'service-switches.always-on': 'This service cannot be switched off.',
    'service-switches.portal-wide-cannot-be-cleared': 'The portal-wide value is either on or off.',
    'service-switches.no-such-service': 'There is no such service.',
    'branches.not-found': 'This unit no longer exists.',
  },
};
