/** Marks an item as the General Council's (shared, 7.3) and as retired (D-100). */
export function ItemBadges(props: {
  national: boolean;
  retired: boolean;
  labels: { national: string; retired: string };
}) {
  return (
    <>
      {props.national && (
        <span className="rounded bg-slate-100 px-2 text-sm">{props.labels.national}</span>
      )}
      {props.retired && (
        <span className="rounded bg-amber-100 px-2 text-sm">{props.labels.retired}</span>
      )}
    </>
  );
}
