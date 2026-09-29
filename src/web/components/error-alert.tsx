import { ApiError } from '../app/api/api-error';
import { RefusalAlert } from './refusal-alert';

/**
 * A failed call explained: the portal's refusal with its numbers, or an
 * upload's own failure. Without the screen's own refusals, the portal-wide
 * ones explain it (D-224: a refusal is never shown as a general error).
 */
export function ErrorAlert(props: {
  error: Error | null;
  refusals?: Partial<Record<string, string>>;
}) {
  const { error } = props;
  const refusals = props.refusals ?? {};
  if (!error) return null;
  return error instanceof ApiError ? (
    <RefusalAlert code={error.code} values={error.values} refusals={refusals} />
  ) : (
    <RefusalAlert code={error.message} refusals={refusals} />
  );
}
