import {Show} from 'solid-js';
import Section from '@components/section';
import Row from '@components/rowTsx';
import RangeSettingSelector from '@components/rangeSettingSelector';
import {i18n} from '@lib/langPack';
import {useAppSettings} from '@stores/appSettings';
import {toastNew} from '@components/toast';
import showZWebInputPopup from '@components/popups/zwebInput';
import {DEFAULT_ZWEB_STATE} from '@config/zwebState';
import {ZRadioGroup, ZToggle} from '@components/sidebarLeft/tabs/zweb/shared';

const ZWebGeneral = () => {
  const [appSettings, setAppSettings] = useAppSettings();
  const zweb = () => appSettings.zweb!;

  return (
    <>
      <Section name="zWeb.General.Network">
        <ZRadioGroup
          key="downloadSpeed"
          values={[
            {value: 'off', title: 'zWeb.General.SpeedOff'},
            {value: 'fast', title: 'zWeb.General.SpeedFast', subtitle: 'zWeb.General.DownloadSpeed.Info'},
            {value: 'ultra', title: 'zWeb.General.SpeedUltra'}
          ]}
        />
        <ZToggle key="uploadBoost" title="zWeb.General.UploadBoost" subtitle="zWeb.General.UploadBoost.Info" />
        <RangeSettingSelector
          textLeft={i18n('zWeb.General.ParallelDownloads')}
          textRight={(value) => '' + value}
          step={1}
          minValue={1}
          maxValue={8}
          value={zweb().parallelDownloads}
          onChange={(value) => setAppSettings('zweb', 'parallelDownloads', value)}
        />
        <ZToggle key="useIPv6" title="zWeb.General.IPv6" subtitle="zWeb.General.IPv6.Info" />
        <ZRadioGroup
          key="dnsType"
          values={[
            {value: 'system', title: 'zWeb.General.DnsSystem'},
            {value: 'google', title: 'zWeb.General.DnsGoogle'},
            {value: 'cloudflare', title: 'zWeb.General.DnsCloudflare'},
            {value: 'custom', title: 'zWeb.General.DnsCustom'}
          ]}
        />
        <Show when={zweb().dnsType === 'custom'}>
          <Row clickable={() => showZWebInputPopup({
            titleLangKey: 'zWeb.General.CustomDoH',
            placeholder: 'https://dns.example.com/dns-query',
            value: zweb().customDoH,
            onChange: (value) => setAppSettings('zweb', 'customDoH', value)
          })}>
            <Row.Title>{i18n('zWeb.General.CustomDoH')}</Row.Title>
            <Row.Subtitle>{zweb().customDoH || i18n('zWeb.General.NotSet')}</Row.Subtitle>
          </Row>
        </Show>
        <ZToggle key="autoRetryUploads" title="zWeb.General.AutoRetry" subtitle="zWeb.General.AutoRetry.Info" />
      </Section>

      <Section name="zWeb.General.Storage">
        <ZToggle key="saveToChatSubfolder" title="zWeb.General.SaveToChatSubfolder" subtitle="zWeb.General.SaveToChatSubfolder.Info" />
        <Row clickable={() => showZWebInputPopup({
          titleLangKey: 'zWeb.General.SavePath',
          placeholder: 'zWeb',
          value: zweb().savePath,
          onChange: (value) => setAppSettings('zweb', 'savePath', value || 'zWeb')
        })}>
          <Row.Title>{i18n('zWeb.General.SavePath')}</Row.Title>
          <Row.Subtitle>{zweb().savePath || 'zWeb'}</Row.Subtitle>
        </Row>
      </Section>

      <Section name="zWeb.General.Bots">
        <ZToggle key="botPrivacyEnabled" title="zWeb.General.BotPrivacy" subtitle="zWeb.General.BotPrivacy.Info" />
        <Show when={zweb().botPrivacyEnabled}>
          <ZToggle key="botPrivacyAlwaysAsk" title="zWeb.General.BotPrivacyAlwaysAsk" subtitle="zWeb.General.BotPrivacyAlwaysAsk.Info" />
          <Row clickable={() => showZWebInputPopup({
            titleLangKey: 'zWeb.General.BotPrivacyAccount',
            placeholder: '+7 999 123-45-67',
            value: zweb().botPrivacyAccount,
            onChange: (value) => setAppSettings('zweb', 'botPrivacyAccount', value)
          })}>
            <Row.Title>{i18n('zWeb.General.BotPrivacyAccount')}</Row.Title>
            <Row.Subtitle>{zweb().botPrivacyAccount || i18n('zWeb.General.BotPrivacyAccountCurrent')}</Row.Subtitle>
          </Row>
        </Show>
      </Section>

      <Section name="zWeb.General.Profile">
        <ZToggle key="relativeLastSeen" title="zWeb.General.RelativeLastSeen" subtitle="zWeb.General.RelativeLastSeen.Info" />
        <ZToggle key="hidePhone" title="zWeb.General.HidePhone" subtitle="zWeb.General.HidePhone.Info" />
        <ZToggle key="showIdAndDc" title="zWeb.General.ShowIdAndDc" subtitle="zWeb.General.ShowIdAndDc.Info" />
        <ZToggle key="showRegistrationDate" title="zWeb.General.ShowRegistrationDate" subtitle="zWeb.General.ShowRegistrationDate.Info" />
      </Section>

      <Section name="zWeb.General.ChatList">
        <ZToggle key="sortByUnread" title="zWeb.General.SortByUnread" subtitle="zWeb.General.SortByUnread.Info" />
        <ZToggle key="unlimitedPinned" title="zWeb.General.UnlimitedPinned" subtitle="zWeb.General.UnlimitedPinned.Info" />
        <ZToggle key="hideArchive" title="zWeb.General.HideArchive" subtitle="zWeb.General.HideArchive.Info" />
        <ZToggle key="archiveOnPull" title="zWeb.General.ArchiveOnPull" subtitle="zWeb.General.ArchiveOnPull.Info" />
        <ZToggle key="disableUnarchiveSwipe" title="zWeb.General.DisableUnarchiveSwipe" subtitle="zWeb.General.DisableUnarchiveSwipe.Info" />
        <ZToggle key="showSenderMiniAvatars" title="zWeb.General.SenderMiniAvatars" subtitle="zWeb.General.SenderMiniAvatars.Info" />
        <ZToggle key="showFolderCounters" title="zWeb.General.FolderCounters" subtitle="zWeb.General.FolderCounters.Info" />
      </Section>

      <Section name="zWeb.General.Notifications">
        <ZRadioGroup
          key="pushService"
          values={[
            {value: 'auto', title: 'zWeb.General.PushAuto'},
            {value: 'webpush', title: 'zWeb.General.PushWeb'},
            {value: 'off', title: 'zWeb.General.PushOff'}
          ]}
        />
        <ZToggle key="inAppVibration" title="zWeb.General.Vibration" subtitle="zWeb.General.Vibration.Info" />
        <ZToggle key="notificationBubbles" title="zWeb.General.Bubbles" subtitle="zWeb.General.Bubbles.Info" />
        <ZToggle key="keepNotificationsForDeleted" title="zWeb.General.KeepDeletedNotifications" subtitle="zWeb.General.KeepDeletedNotifications.Info" />
      </Section>

      <Section name="zWeb.General.Navigation">
        <ZToggle key="bottomNavigation" title="zWeb.General.BottomNavigation" subtitle="zWeb.General.BottomNavigation.Info" />
        <ZToggle key="tabsInSidebar" title="zWeb.General.TabsInSidebar" subtitle="zWeb.General.TabsInSidebar.Info" />
      </Section>

      <Section>
        <Row clickable={() => {
          setAppSettings('zweb', DEFAULT_ZWEB_STATE);
          toastNew({langPackKey: 'zWeb.ResetDone'});
        }}>
          <Row.Icon icon="reload_star" />
          <Row.Title>{i18n('zWeb.General.Reset')}</Row.Title>
          <Row.Subtitle>{i18n('zWeb.General.Reset.Info')}</Row.Subtitle>
        </Row>
      </Section>
    </>
  );
};

export default ZWebGeneral;
