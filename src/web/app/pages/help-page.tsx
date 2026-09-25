import { PageHeading } from '../../components/page-heading';
import { OfficerText } from '../../components/officer-text';
import { useText } from '../language/use-text';

/** Brief 25 C5 and D-083: the administrator's one help text, linked from the footer. */
export function HelpPage() {
  const text = useText();
  return (
    <section className="flex max-w-prose flex-col gap-4">
      <PageHeading>{text.portalShell.help.title}</PageHeading>
      <OfficerText textKey="help" />
    </section>
  );
}
