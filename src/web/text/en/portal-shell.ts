export const portalShellText = {
  loading: 'Loading…',
  notConfigured: 'This has not been set up yet. Please ask your administrator.',
  somethingWentWrong: 'Something went wrong. Please try again.',
  pageNotFound: 'This page does not exist.',
  signOut: 'Sign out',
  home: {
    welcome: 'Welcome to the committee portal.',
    unit: 'Unit',
  },
  secondFactorRequired: {
    title: 'Two-step verification needed',
    explanation:
      'Your access requires two-step verification. Set it up below, then sign out and sign in again.',
  },
  accessNotActive: {
    title: 'Access not active',
  },
  privacyNotice: {
    title: 'Privacy notice',
    confirm: 'I have read this',
    continue: 'Continue',
    changed: 'The privacy notice has just changed. Please read the new version.',
  },
  inbox: {
    link: 'Notifications',
    linkUnread: 'Notifications ({count} unread)',
    heading: 'Notifications',
    none: 'No notifications.',
    unread: 'Unread',
    markAllRead: 'Mark all as read',
    open: 'Mark as read',
    kinds: {
      'task-tracker.due-soon': 'Reminder: "{title}" is due on {dueDate}.',
      'task-tracker.overdue': '"{title}" was due on {dueDate} and is overdue.',
      'communication-hub.notice': 'New notice in {unit}: "{title}".',
      'communication-hub.vote': 'New vote in {unit}: "{title}". You are one of its voters.',
      'communication-hub.vote-result': 'The result of the vote "{title}" in {unit} is out.',
      'communication-hub.circular': 'New national circular: "{title}".',
      'communication-hub.request': 'New request from {unit}: "{title}".',
      'communication-hub.reply': 'New reply in "{about}".',
    },
    unknown: 'A notification.',
  },
  navigation: {
    label: 'Services',
    administration: 'Administration panel',
  },
  footer: {
    privacyNotice: 'Privacy notice',
    help: 'Help',
  },
  language: {
    label: 'Language',
    // Each language is always named in its own script, in both bundles.
    en: 'English',
    ar: 'العربية',
  },
  unitSwitcher: {
    label: 'Unit',
  },
  maintenanceBanner:
    'The portal is in maintenance mode. You can read everything but change nothing.',
  bilingualName: {
    nameEn: 'Name in English',
    nameAr: 'Name in Arabic',
    rename: 'Rename',
    renameItem: 'Rename {name}',
    save: 'Save',
    cancel: 'Cancel',
  },
  order: {
    moveUp: 'Up',
    moveDown: 'Down',
    moveUpItem: 'Move {name} up',
    moveDownItem: 'Move {name} down',
  },
  help: {
    title: 'Help',
  },
};
