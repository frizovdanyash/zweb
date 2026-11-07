import Section from '@components/section';
import Row from '@components/rowTsx';
import RangeSettingSelector from '@components/rangeSettingSelector';
import I18n, {i18n} from '@lib/langPack';
import {useAppSettings} from '@stores/appSettings';
import showZWebInputPopup from '@components/popups/zwebInput';
import {DEFAULT_ZWEB_STATE} from '@config/zwebState';
import {toastNew} from '@components/toast';
import {presetToThemeSettings} from '@config/themePresets';
import themeController from '@helpers/themeController';
import {ZToggle} from '@components/sidebarLeft/tabs/zweb/shared';
import type {Theme} from '@layer';

/** Фирменная фиолетово-чёрная палитра zWeb: акцент и пузыри исходящих. */
export const ZWEB_PRESET = {
  id: 9001,
  accent_color: 0x8b5cf6,
  message_colors: [0x8b5cf6, 0x5b21b6]
};

export function applyZWebTheme(dark = true) {
  const settings = presetToThemeSettings(ZWEB_PRESET, dark ? 'baseThemeNight' : 'baseThemeClassic');
  const theme: Theme = {
    _: 'theme',
    id: 'preset:9001',
    access_hash: '',
    slug: '',
    title: 'zWeb',
    pFlags: {},
    settings: [settings]
  };
  themeController.applyNewTheme(theme);
}

const ZWebAppearance = () => {
  const [appSettings, setAppSettings] = useAppSettings();
  const zweb = () => appSettings.zweb!;

  return (
    <>
      <Section name="zWeb.Appearance.Theme" caption="zWeb.Appearance.Theme.Info">
        <Row clickable={() => {
          applyZWebTheme(true);
          toastNew({langPackKey: 'zWeb.Appearance.ThemeApplied'});
        }}>
          <Row.Icon icon="appearance_filled" />
          <Row.Title>{i18n('zWeb.Appearance.ThemeDark')}</Row.Title>
          <Row.Subtitle>{i18n('zWeb.Appearance.ThemeDark.Info')}</Row.Subtitle>
        </Row>
        <Row clickable={() => {
          applyZWebTheme(false);
          toastNew({langPackKey: 'zWeb.Appearance.ThemeApplied'});
        }}>
          <Row.Icon icon="appearance_filled" />
          <Row.Title>{i18n('zWeb.Appearance.ThemeLight')}</Row.Title>
          <Row.Subtitle>{i18n('zWeb.Appearance.ThemeLight.Info')}</Row.Subtitle>
        </Row>
      </Section>

      <Section name="zWeb.Appearance.General">
        <RangeSettingSelector
          textLeft={i18n('zWeb.Appearance.AvatarCorners')}
          textRight={(value) => value === 0 ? I18n.format('zWeb.Appearance.Square', true) :
            value === 100 ? I18n.format('zWeb.Appearance.Circle', true) : value + '%'}
          step={5}
          minValue={0}
          maxValue={100}
          value={zweb().avatarCorners}
          onChange={(value) => setAppSettings('zweb', 'avatarCorners', value)}
        />
        <RangeSettingSelector
          textLeft={i18n('zWeb.Appearance.SectionRadius')}
          textRight={(value) => value === 0 ? I18n.format('zWeb.Appearance.Off', true) : value + '%'}
          step={5}
          minValue={0}
          maxValue={100}
          value={zweb().sectionRadius}
          onChange={(value) => setAppSettings('zweb', 'sectionRadius', value)}
        />
        <ZToggle key="m3ListItems" title="zWeb.Appearance.M3" subtitle="zWeb.Appearance.M3.Info" />
        <ZToggle key="removeMessageTail" title="zWeb.Appearance.RemoveTail" subtitle="zWeb.Appearance.RemoveTail.Info" />
      </Section>

      <Section name="zWeb.Appearance.Header">
        <ZToggle key="centerTitle" title="zWeb.Appearance.CenterTitle" subtitle="zWeb.Appearance.CenterTitle.Info" />
        <Row clickable={() => showZWebInputPopup({
          titleLangKey: 'zWeb.Appearance.CustomTitle',
          placeholder: 'zWeb',
          maxLength: 24,
          value: zweb().customTitle,
          onChange: (value) => setAppSettings('zweb', 'customTitle', value)
        })}>
          <Row.Title>{i18n('zWeb.Appearance.CustomTitle')}</Row.Title>
          <Row.Subtitle>{zweb().customTitle || 'zWeb'}</Row.Subtitle>
        </Row>
        <ZToggle key="hideSearchBar" title="zWeb.Appearance.HideSearchBar" subtitle="zWeb.Appearance.HideSearchBar.Info" />
        <ZToggle key="hideStories" title="zWeb.Appearance.HideStories" subtitle="zWeb.Appearance.HideStories.Info" />
        <ZToggle key="hideFloatingButton" title="zWeb.Appearance.HideFloating" subtitle="zWeb.Appearance.HideFloating.Info" />
        <ZToggle key="forceSnow" title="zWeb.Appearance.Snow" subtitle="zWeb.Appearance.Snow.Info" />
      </Section>

      <Section>
        <Row clickable={() => {
          ['avatarCorners', 'sectionRadius', 'm3ListItems', 'removeMessageTail', 'centerTitle',
            'customTitle', 'hideSearchBar', 'hideStories', 'hideFloatingButton', 'forceSnow'].forEach((key) => {
            setAppSettings('zweb', key as any, (DEFAULT_ZWEB_STATE as any)[key]);
          });
          toastNew({langPackKey: 'zWeb.ResetDone'});
        }}>
          <Row.Icon icon="reload_star" />
          <Row.Title>{i18n('zWeb.Appearance.Reset')}</Row.Title>
        </Row>
      </Section>
    </>
  );
};

export default ZWebAppearance;
