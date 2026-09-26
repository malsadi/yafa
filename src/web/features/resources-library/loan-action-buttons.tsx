/** D-109 and D-099: open the correction or the return of a loan. */
export function LoanActionButtons(props: {
  labels: { correct: string; recordReturn: string };
  onOpen: (which: 'correct' | 'return') => void;
}) {
  return (
    <span className="flex gap-2">
      <button
        type="button"
        className="underline"
        onClick={() => {
          props.onOpen('correct');
        }}
      >
        {props.labels.correct}
      </button>
      <button
        type="button"
        className="underline"
        onClick={() => {
          props.onOpen('return');
        }}
      >
        {props.labels.recordReturn}
      </button>
    </span>
  );
}
