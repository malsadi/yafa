import type { ChecklistItem } from '../../../../shared/administration-panel/setup-checklist';
import type { TextBundle } from '../../../text';
import { fillText } from '../../../text/fill-text';
import { settingName } from '../setting-name';

/** What one checklist item asks for, in the officer's language. */
export function checklistItemText(text: TextBundle, item: ChecklistItem): string {
  const admin = text.services['administration-panel'];
  const t = admin.setupChecklist;
  switch (item.kind) {
    case 'privacy-notice':
      return t.privacyNotice;
    case 'designation':
      return fillText(t.designation, { designation: admin.designations[item.designation] });
    case 'setting':
      return fillText(t.setting, { setting: settingName(text, item.key) });
  }
}
