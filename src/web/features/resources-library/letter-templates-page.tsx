import { useState } from 'react';
import { useText } from '../../app/language/use-text';
import { useActiveSession } from '../../app/session/use-active-session';
import { StatusMessage } from '../../components/status-message';
import { LetterTemplateEditing } from './letter-template-editing';
import { LetterTemplateList } from './letter-template-list';
import { useLetterTemplates } from './use-letter-templates';
import { useLibraryUnit } from './use-library-unit';

/** Brief 16 D1: the unit's letter templates and the General Council's; write and change its own. */
export function LetterTemplatesPage() {
  const unitId = useLibraryUnit();
  const text = useText();
  const { context } = useActiveSession();
  const templates = useLetterTemplates(unitId);
  // Null: the list; '' a new template; otherwise the template being changed.
  const [editing, setEditing] = useState<string | null>(null);
  if (templates.isPending) return <StatusMessage>{text.portalShell.loading}</StatusMessage>;
  if (templates.isError)
    return <StatusMessage>{text.portalShell.somethingWentWrong}</StatusMessage>;
  if (editing !== null) {
    return (
      <LetterTemplateEditing
        unitId={unitId}
        unit={templates.data.letterheadUnit}
        template={templates.data.templates.find((t) => t.id === editing)}
        onDone={() => {
          setEditing(null);
        }}
      />
    );
  }
  return (
    <LetterTemplateList
      unitId={unitId}
      templates={templates.data.templates}
      mayManage={context.capabilities.includes('resources-library.letter-templates.manage')}
      onEdit={setEditing}
    />
  );
}
