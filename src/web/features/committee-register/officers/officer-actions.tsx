import { useState } from 'react';
import { EditPersonForm } from './edit-person-form';
import { OfficerActionButtons } from './officer-action-buttons';
import { EndTermForm } from './end-term-form';

interface OfficerActionsProps {
  person: { name: string; phone: string };
  busy: boolean;
  onUpdate: (changes: { name: string; phone: string }) => void;
  onEnd: (endDate: string) => void;
}

/** Brief 14 B1 and B3: correct a person's details, or end their term. */
export function OfficerActions({ person, busy, onUpdate, onEnd }: OfficerActionsProps) {
  const [open, setOpen] = useState<'edit' | 'end' | null>(null);
  const close = () => {
    setOpen(null);
  };
  if (open === 'edit') {
    return (
      <EditPersonForm
        initial={person}
        busy={busy}
        onSave={(changes) => {
          onUpdate(changes);
          close();
        }}
        onCancel={close}
      />
    );
  }
  if (open === 'end') {
    return (
      <EndTermForm
        busy={busy}
        onEnd={(endDate) => {
          onEnd(endDate);
          close();
        }}
        onCancel={close}
      />
    );
  }
  return (
    <OfficerActionButtons
      onEdit={() => {
        setOpen('edit');
      }}
      onEnd={() => {
        setOpen('end');
      }}
    />
  );
}
