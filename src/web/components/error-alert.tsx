import { ApiError } from '../app/api/api-error';
import { RefusalAlert } from './refusal-alert';

/** A failed call explained: the portal's refusal with its numbers, or an upload's own failure. */
export function ErrorAlert(props: {
  error: Error | null;
  refusals: Partial<Record<string, string>>;
}) {
  const { error } = props;
  if (!error) return null;
  return error instanceof ApiError ? (
    <RefusalAlert code={error.code} values={error.values} refusals={props.refusals} />
  ) : (
    <RefusalAlert code={error.message} refusals={props.refusals} />
  );
}
