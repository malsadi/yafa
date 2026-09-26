import { useState } from 'react';
import { useLanguage } from '../../app/language/use-language';
import { useText } from '../../app/language/use-text';
import { ErrorAlert } from '../../components/error-alert';
import { StatusMessage } from '../../components/status-message';
import { HubChoiceButtons } from './hub-choice-buttons';
import { ConversationThread } from './conversation-thread';
import { roleNetworkPath } from './conversations.api';
import { useRoleNetworks } from './use-conversations';

/** Brief 20 B1 and D-158: the officer's role networks — one shared conversation for each role they hold. */
export function RoleNetworksPage() {
  const text = useText();
  const t = text.services['communication-hub'];
  const { language } = useLanguage();
  const networks = useRoleNetworks();
  const [chosen, setChosen] = useState<string | null>(null);
  if (networks.isPending) return <StatusMessage>{text.portalShell.loading}</StatusMessage>;
  if (networks.isError) return <ErrorAlert error={networks.error} refusals={t.refusals} />;
  const roleId = chosen ?? networks.data[0]?.roleId ?? null;
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold">{t.roleNetworks.heading}</h2>
      {networks.data.length === 0 && <p>{t.roleNetworks.none}</p>}
      <HubChoiceButtons
        label={t.roleNetworks.heading}
        choices={networks.data.map((n) => ({
          value: n.roleId,
          label: language === 'ar' ? n.nameAr : n.nameEn,
        }))}
        chosen={roleId ?? ''}
        onChoose={setChosen}
      />
      {roleId && (
        <>
          <p className="text-sm">{t.roleNetworks.explanation}</p>
          <ConversationThread key={roleId} path={roleNetworkPath(roleId)} />
        </>
      )}
    </section>
  );
}
