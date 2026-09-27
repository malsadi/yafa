import { useState } from 'react';
import { useText } from '../../app/language/use-text';
import { TaskForm } from './task-form';

/** Brief 18 A1: the button that opens a new task's form. */
export function AddTaskControl({ unitId }: { unitId: string }) {
  const t = useText().services['task-tracker'];
  const [adding, setAdding] = useState(false);
  if (adding)
    return (
      <TaskForm
        unitId={unitId}
        onDone={() => {
          setAdding(false);
        }}
      />
    );
  return (
    <button
      type="button"
      className="self-start rounded bg-slate-800 px-4 py-2 text-white"
      onClick={() => {
        setAdding(true);
      }}
    >
      {t.add}
    </button>
  );
}
