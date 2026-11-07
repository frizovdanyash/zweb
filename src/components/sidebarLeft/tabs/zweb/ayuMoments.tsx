import {createEffect, createResource, createSignal, onMount, Show} from 'solid-js';
import Section from '@components/section';
import Row from '@components/rowTsx';
import RangeSettingSelector from '@components/rangeSettingSelector';
import {i18n} from '@lib/langPack';
import {useAppSettings} from '@stores/appSettings';
import showZWebInputPopup from '@components/popups/zwebInput';
import {toastNew} from '@components/toast';
import appNavigationController from '@components/appNavigationController';
import {useSuperTab} from '@components/solidJsTabs/superTabProvider';
import {clearAllEntries, DeletedEntry, getAllEntries, getEntriesForPeer} from '@lib/zweb/ayuMoments';
import {ZToggle} from '@components/sidebarLeft/tabs/zweb/shared';

const ZWebAyuMoments = () => {
  const [tab] = useSuperTab();
  const [appSettings, setAppSettings] = useAppSettings();
  const [version, setVersion] = createSignal(0);
  const [openPeer, setOpenPeer] = createSignal<string>();
  const [openedEntry, setOpenedEntry] = createSignal<string>();
  const [titles, setTitles] = createSignal<{[peerId: string]: string}>({});

  onMount(() => {
    const item = {
      type: 'zweb-ayu' as any,
      onPop: () => tab.close()
    };
    appNavigationController.pushItem(item);
    return () => appNavigationController.removeItem(item);
  });

  const [entries] = createResource(version, () => getAllEntries().catch(() => [] as DeletedEntry[]));
  const [peerEntries] = createResource(
    () => ({peerId: openPeer(), version: version()}),
    ({peerId}) => peerId ? getEntriesForPeer(peerId) : Promise.resolve([] as DeletedEntry[])
  );

  const loadTitles = async(peerIds: string[]) => {
    const {default: getPeerTitle} = await import('@components/wrappers/getPeerTitle');
    const next: {[peerId: string]: string} = {...titles()};
    for(const peerId of peerIds) {
      if(next[peerId]) continue;
      try {
        next[peerId] = await getPeerTitle({peerId: +peerId, plainText: true});
      } catch(err) {
        next[peerId] = peerId;
      }
    }
    setTitles(next);
  };

  createEffect(() => {
    const list = entries();
    if(!list?.length) return;
    loadTitles(Array.from(new Set(list.map((entry) => entry.peerId))));
  });

  const groups = () => (entries() || []).reduce((acc, entry) => {
    acc[entry.peerId] = (acc[entry.peerId] || 0) + 1;
    return acc;
  }, {} as {[peerId: string]: number});

  return (
    <>
      <Section name="zWeb.Ayu.Save" caption="zWeb.Ayu.Save.Info">
        <ZToggle key="saveDeletedMessages" title="zWeb.Ayu.SaveDeleted" subtitle="zWeb.Ayu.SaveDeleted.Info" />
        <ZToggle key="saveEditedMessages" title="zWeb.Ayu.SaveEdited" subtitle="zWeb.Ayu.SaveEdited.Info" />
        <RangeSettingSelector
          textLeft={i18n('zWeb.Ayu.KeepDays')}
          textRight={(value) => '' + value}
          step={1}
          minValue={1}
          maxValue={365}
          value={appSettings.zweb.keepDeletedDays}
          onChange={(value) => setAppSettings('zweb', 'keepDeletedDays', value)}
        />
      </Section>

      <Section name="zWeb.Ayu.Ghost">
        <ZToggle key="ghostMode" title="zWeb.Ayu.Ghost" subtitle="zWeb.Ayu.Ghost.Info" />
        <Row clickable={() => showZWebInputPopup({
          titleLangKey: 'zWeb.Ayu.GhostExceptions',
          placeholder: '123456789, -1001234567890',
          value: appSettings.zweb.ghostExceptions,
          onChange: (value) => setAppSettings('zweb', 'ghostExceptions', value)
        })}>
          <Row.Title>{i18n('zWeb.Ayu.GhostExceptions')}</Row.Title>
          <Row.Subtitle>{appSettings.zweb.ghostExceptions || i18n('zWeb.General.NotSet')}</Row.Subtitle>
        </Row>
      </Section>

      <Section name="zWeb.Ayu.Filters" caption="zWeb.Ayu.Filters.Info">
        <Row clickable={() => showZWebInputPopup({
          titleLangKey: 'zWeb.Ayu.Filters',
          placeholder: 'реклама|spam',
          value: appSettings.zweb.messageFilters,
          maxLength: 2000,
          onChange: (value) => setAppSettings('zweb', 'messageFilters', value)
        })}>
          <Row.Icon icon="filter" />
          <Row.Title>{i18n('zWeb.Ayu.Filters')}</Row.Title>
          <Row.Subtitle>{appSettings.zweb.messageFilters || i18n('zWeb.General.NotSet')}</Row.Subtitle>
        </Row>
      </Section>

      <Section name="zWeb.Ayu.Archive">
        <Show when={Object.keys(groups()).length} fallback={
          <Row><Row.Title>{i18n('zWeb.Ayu.Empty')}</Row.Title></Row>
        }>
          {Object.entries(groups()).map(([peerId, count]) => (
            <Row clickable={() => setOpenPeer(openPeer() === peerId ? undefined : peerId)}>
              <Row.Icon icon="archive_filled" />
              <Row.Title titleRight={String(count)} titleRightSecondary>
                {titles()[peerId] || peerId}
              </Row.Title>
            </Row>
          ))}
        </Show>
        <Show when={openPeer()}>
          {(peerEntries() || []).map((entry) => (
            <Row clickable={() => setOpenedEntry(openedEntry() === entry.key ? undefined : entry.key)}>
              <Row.Title>{entry.kind === 'deleted' ? i18n('zWeb.Ayu.Deleted') : i18n('zWeb.Ayu.Edited')}</Row.Title>
              <Row.Subtitle>
                {entry.text || '—'}
                {openedEntry() === entry.key ? ' · ' + new Date(entry.deletedAt).toLocaleString() : ''}
              </Row.Subtitle>
            </Row>
          ))}
        </Show>
        <Row clickable={async() => {
          await clearAllEntries();
          setVersion(version() + 1);
          toastNew({langPackKey: 'zWeb.Ayu.Cleared'});
        }}>
          <Row.Icon icon="delete_filled" />
          <Row.Title>{i18n('zWeb.Ayu.Clear')}</Row.Title>
        </Row>
      </Section>
    </>
  );
};

export default ZWebAyuMoments;
