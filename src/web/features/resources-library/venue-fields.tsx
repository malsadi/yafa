import { useText } from '../../app/language/use-text';
import { TextAreaField } from '../../components/text-area-field';
import { TextField } from '../../components/text-field';
import { fillText } from '../../text/fill-text';
import type { VenueDraft } from './venue-draft';

const OPTIONAL = [
  ['address', 'text'],
  ['capacity', 'number'],
  ['facilities', 'text'],
  ['contactName', 'text'],
  ['contactPhone', 'tel'],
  ['contactEmail', 'email'],
  ['typicalCostPence', 'text'],
  ['typicalCostNote', 'text'],
] as const;

/** Brief 16 B1 and D-105: the name, and every other detail optional. */
export function VenueFields(props: { draft: VenueDraft; onChange: (draft: VenueDraft) => void }) {
  const t = useText().services['resources-library'].venues;
  const set = (key: keyof VenueDraft) => (value: string) => {
    props.onChange({ ...props.draft, [key]: value });
  };
  const labels: Record<(typeof OPTIONAL)[number][0], string> = {
    address: t.address,
    capacity: t.capacity,
    facilities: t.facilities,
    contactName: t.contactName,
    contactPhone: t.contactPhone,
    contactEmail: t.contactEmail,
    typicalCostPence: t.typicalCost,
    typicalCostNote: t.typicalCostNote,
  };
  return (
    <>
      <TextField label={t.name} value={props.draft.name} onChange={set('name')} />
      {OPTIONAL.map(([key, type]) => {
        const label = fillText(t.optional, { label: labels[key] });
        return key === 'address' || key === 'facilities' ? (
          <TextAreaField key={key} label={label} value={props.draft[key]} onChange={set(key)} />
        ) : (
          <TextField
            key={key}
            label={label}
            type={type}
            value={props.draft[key]}
            onChange={set(key)}
            optional
          />
        );
      })}
    </>
  );
}
