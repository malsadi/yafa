import { equipmentText } from './equipment';
import { filedLettersText } from './filed-letters';
import { letterTemplatesText } from './letter-templates';
import { libraryResourcesText } from './library-resources';
import { venuesText } from './venues';

export const resourcesLibraryText = {
  name: 'Resources library',
  capabilities: {
    'resources-library.library.read': 'Read the library',
    'resources-library.resources.manage': 'Manage templates and guides',
    'resources-library.venues.manage': 'Manage venues',
    'resources-library.equipment.manage': 'Manage equipment and loans',
    'resources-library.letter-templates.manage': 'Manage letter templates',
    'resources-library.correspondence.read': 'Read letters in and out',
  },
  sections: {
    label: 'Library sections',
    templates: 'Templates',
    guides: 'Guides',
    venues: 'Venues',
    equipment: 'Equipment',
    letterTemplates: 'Letter templates',
    lettersOut: 'Letters out',
    lettersIn: 'Letters in',
  },
  resources: libraryResourcesText,
  venues: venuesText,
  equipment: equipmentText,
  letterTemplates: letterTemplatesText,
  filedLetters: filedLettersText,
};
