import Section from '@components/section';
import Row from '@components/rowTsx';
import RangeSettingSelector from '@components/rangeSettingSelector';
import I18n, {i18n, LangPackKey} from '@lib/langPack';
import {useAppSettings} from '@stores/appSettings';
import showZWebInputPopup from '@components/popups/zwebInput';
import {DEFAULT_ZWEB_STATE, ZWebState} from '@config/zwebState';
import {toastNew} from '@components/toast';
import {ZToggle, ZWebKey} from '@components/sidebarLeft/tabs/zweb/shared';

const TITLE = (key: string) => ('zWeb.Chats.' + key) as LangPackKey;
const SUB = (key: string) => ('zWeb.Chats.' + key + '.Info') as LangPackKey;

const ZWebChats = () => {
  const [appSettings, setAppSettings] = useAppSettings();
  const zweb = () => appSettings.zweb!;

  const reset = () => {
    const keys: ZWebKey[] = [
      'doubleTapReaction', 'doubleTapReactionEmoji', 'hideReactions', 'hideReactionsChannels',
      'hideReactionsGroups', 'hideReactionsPrivate', 'hideShareButton', 'hideGiftButton',
      'hideSearchButton', 'hideCallButton', 'hideSendAsPeer', 'keepAttachButton',
      'disableGreetingSticker', 'adminShortcuts', 'disableGlobalSearch', 'tapToSwitchRecord',
      'alwaysSendInHD', 'rememberLastUsedCamera', 'preferOriginalQuality', 'pauseOnMinimize',
      'swipeToPip', 'unmuteWithVolumeButtons', 'doubleTapSeekDuration', 'stickerSize',
      'unreadCapsule', 'replaceEditedWithIcon', 'showResultsBeforeVoting', 'quickTransitions',
      'seamlessSwitching', 'mediaMenuSave', 'mediaMenuCopyPhoto', 'mediaMenuRepeat',
      'mediaMenuClear', 'hideKeyboardOnScroll', 'hideTimeOnStickers', 'disableProximityEvents'
    ];
    keys.forEach((key) => setAppSettings('zweb', key as any, (DEFAULT_ZWEB_STATE as any)[key]));
    toastNew({langPackKey: 'zWeb.ResetDone'});
  };

  return (
    <>
      <Section name={TITLE('Stickers')}>
        <RangeSettingSelector
          textLeft={i18n(TITLE('StickerSize'))}
          textRight={(value) => '' + value}
          step={1}
          minValue={8}
          maxValue={24}
          value={zweb().stickerSize}
          onChange={(value) => setAppSettings('zweb', 'stickerSize', value)}
        />
        <ZToggle key="hideTimeOnStickers" title={TITLE('StickerTime')} subtitle={SUB('StickerTime')} />
        <ZToggle key="disableGreetingSticker" title={TITLE('DisableGreeting')} subtitle={SUB('DisableGreeting')} />
      </Section>

      <Section name={TITLE('DoubleTap')}>
        <ZToggle key="doubleTapReaction" title={TITLE('DoubleTapReaction')} subtitle={SUB('DoubleTapReaction')} />
        {zweb().doubleTapReaction && (
          <Row clickable={() => showZWebInputPopup({
            titleLangKey: TITLE('DoubleTapEmoji'),
            placeholder: '❤',
            maxLength: 8,
            value: zweb().doubleTapReactionEmoji,
            onChange: (value) => setAppSettings('zweb', 'doubleTapReactionEmoji', value || '❤')
          })}>
            <Row.Title>{i18n(TITLE('DoubleTapEmoji'))}</Row.Title>
            <Row.Subtitle>{zweb().doubleTapReactionEmoji}</Row.Subtitle>
          </Row>
        )}
        <RangeSettingSelector
          textLeft={i18n(TITLE('SeekDuration'))}
          textRight={(value) => value + ' ' + I18n.format('Seconds', true)}
          step={1}
          minValue={2}
          maxValue={30}
          value={zweb().doubleTapSeekDuration}
          onChange={(value) => setAppSettings('zweb', 'doubleTapSeekDuration', value)}
        />
      </Section>

      <Section name={TITLE('Messages')}>
        <ZToggle key="replaceEditedWithIcon" title={TITLE('ReplaceEdited')} subtitle={SUB('ReplaceEdited')} />
        <ZToggle key="unreadCapsule" title={TITLE('UnreadCapsule')} subtitle={SUB('UnreadCapsule')} />
        <ZToggle key="showResultsBeforeVoting" title={TITLE('ResultsBeforeVoting')} subtitle={SUB('ResultsBeforeVoting')} />
        <ZToggle key="quickTransitions" title={TITLE('QuickTransitions')} subtitle={SUB('QuickTransitions')} />
        <ZToggle key="seamlessSwitching" title={TITLE('SeamlessSwitching')} subtitle={SUB('SeamlessSwitching')} />
      </Section>

      <Section name={TITLE('Hiding')}>
        <ZToggle key="hideReactions" title={TITLE('HideReactions')} subtitle={SUB('HideReactions')} />
        {zweb().hideReactions && (
          <>
            <ZToggle key="hideReactionsChannels" title={TITLE('HideReactionsChannels')} />
            <ZToggle key="hideReactionsGroups" title={TITLE('HideReactionsGroups')} />
            <ZToggle key="hideReactionsPrivate" title={TITLE('HideReactionsPrivate')} />
          </>
        )}
        <ZToggle key="hideShareButton" title={TITLE('HideShare')} subtitle={SUB('HideShare')} />
        <ZToggle key="hideGiftButton" title={TITLE('HideGift')} subtitle={SUB('HideGift')} />
        <ZToggle key="hideSearchButton" title={TITLE('HideSearch')} subtitle={SUB('HideSearch')} />
        <ZToggle key="hideCallButton" title={TITLE('HideCall')} subtitle={SUB('HideCall')} />
        <ZToggle key="hideSendAsPeer" title={TITLE('HideSendAs')} subtitle={SUB('HideSendAs')} />
      </Section>

      <Section name={TITLE('MessageMenu')}>
        <ZToggle key="mediaMenuSave" title={TITLE('MenuSave')} />
        <ZToggle key="mediaMenuCopyPhoto" title={TITLE('MenuCopyPhoto')} />
        <ZToggle key="mediaMenuRepeat" title={TITLE('MenuRepeat')} />
        <ZToggle key="mediaMenuClear" title={TITLE('MenuClear')} />
      </Section>

      <Section name={TITLE('Media')}>
        <ZToggle key="alwaysSendInHD" title={TITLE('AlwaysHD')} subtitle={SUB('AlwaysHD')} />
        <ZToggle key="rememberLastUsedCamera" title={TITLE('RememberCamera')} subtitle={SUB('RememberCamera')} />
        <ZToggle key="preferOriginalQuality" title={TITLE('OriginalQuality')} subtitle={SUB('OriginalQuality')} />
        <ZToggle key="pauseOnMinimize" title={TITLE('PauseOnMinimize')} subtitle={SUB('PauseOnMinimize')} />
        <ZToggle key="swipeToPip" title={TITLE('SwipeToPip')} subtitle={SUB('SwipeToPip')} />
        <ZToggle key="unmuteWithVolumeButtons" title={TITLE('UnmuteVolume')} subtitle={SUB('UnmuteVolume')} />
      </Section>

      <Section name={TITLE('Input')}>
        <ZToggle key="keepAttachButton" title={TITLE('KeepAttach')} subtitle={SUB('KeepAttach')} />
        <ZToggle key="tapToSwitchRecord" title={TITLE('TapToSwitchRecord')} subtitle={SUB('TapToSwitchRecord')} />
        <ZToggle key="hideKeyboardOnScroll" title={TITLE('HideKeyboardOnScroll')} subtitle={SUB('HideKeyboardOnScroll')} />
      </Section>

      <Section name={TITLE('Other')}>
        <ZToggle key="adminShortcuts" title={TITLE('AdminShortcuts')} subtitle={SUB('AdminShortcuts')} />
        <ZToggle key="disableGlobalSearch" title={TITLE('DisableGlobalSearch')} subtitle={SUB('DisableGlobalSearch')} />
        <ZToggle key="disableProximityEvents" title={TITLE('DisableProximity')} subtitle={SUB('DisableProximity')} />
      </Section>

      <Section>
        <Row clickable={reset}>
          <Row.Icon icon="reload_star" />
          <Row.Title>{i18n(TITLE('Reset'))}</Row.Title>
        </Row>
      </Section>
    </>
  );
};

export default ZWebChats;
