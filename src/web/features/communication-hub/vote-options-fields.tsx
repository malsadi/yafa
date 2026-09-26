import { useText } from '../../app/language/use-text';
import { TextField } from '../../components/text-field';
import { fillText } from '../../text/fill-text';

/** D-156: the vote's options — at least two — added and removed. */
export function VoteOptionsFields(props: {
  options: string[];
  onChange: (options: string[]) => void;
}) {
  const t = useText().services['communication-hub'].noticeForm;
  const { options } = props;
  return (
    <div className="flex flex-col gap-2">
      {options.map((option, index) => (
        <div key={index} className="flex items-end gap-2">
          <div className="flex-1">
            <TextField
              label={fillText(t.option, { number: index + 1 })}
              value={option}
              onChange={(value) => {
                props.onChange(options.map((o, i) => (i === index ? value : o)));
              }}
            />
          </div>
          {options.length > 2 && (
            <button
              type="button"
              className="rounded border border-slate-400 px-3 py-2"
              onClick={() => {
                props.onChange(options.filter((_, i) => i !== index));
              }}
            >
              {t.removeOption}
            </button>
          )}
        </div>
      ))}
      <button
        type="button"
        className="self-start rounded border border-slate-400 px-3 py-1"
        onClick={() => {
          props.onChange([...options, '']);
        }}
      >
        {t.addOption}
      </button>
    </div>
  );
}
