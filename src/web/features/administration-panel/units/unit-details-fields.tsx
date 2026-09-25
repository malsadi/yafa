import { TextAreaField } from '../../../components/text-area-field';
import { useText } from '../../../app/language/use-text';
import { CalendarColourSelect } from './calendar-colour-select';

type DetailField = 'letterheadAddressEn' | 'letterheadAddressAr' | 'calendarColourId';

interface UnitDetailsFieldsProps {
  unitId: string | null;
  letterheadAddressEn: string;
  letterheadAddressAr: string;
  calendarColourId: string;
  onChange: (field: DetailField, value: string) => void;
}

/** Brief 25 B1 and D-076: the letterhead address in both languages, and the calendar colour. */
export function UnitDetailsFields(props: UnitDetailsFieldsProps) {
  const t = useText().services['administration-panel'].units;
  return (
    <>
      <TextAreaField
        label={t.letterheadAddressEn}
        value={props.letterheadAddressEn}
        onChange={(value) => {
          props.onChange('letterheadAddressEn', value);
        }}
      />
      <TextAreaField
        label={t.letterheadAddressAr}
        dir="rtl"
        value={props.letterheadAddressAr}
        onChange={(value) => {
          props.onChange('letterheadAddressAr', value);
        }}
      />
      <CalendarColourSelect
        unitId={props.unitId}
        value={props.calendarColourId}
        onChange={(value) => {
          props.onChange('calendarColourId', value);
        }}
      />
    </>
  );
}
