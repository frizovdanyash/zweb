import {onCleanup, onMount, Show} from 'solid-js';
import Row from '@components/rowTsx';
import Section from '@components/section';
import Icon from '@components/icon';
import {i18n, LangPackKey} from '@lib/langPack';
import {SliderSuperTabConstructable} from '@components/sliderTab';
import {useSuperTab} from '@components/solidJsTabs/superTabProvider';
import {hotReloadGuard} from '@lib/solidjs/hotReloadGuardProvider';
import {ZWEB_AUTHOR_URL, ZWEB_DOCS_URL, ZWEB_NAME, ZWEB_REPO_URL} from '@config/zwebState';
import {getAppVersionText} from '@config/app';
import safeWindowOpen from '@helpers/dom/safeWindowOpen';
import ButtonIcon from '@components/buttonIcon';
import {attachClickEvent} from '@helpers/dom/clickEvent';
import styles from '@components/sidebarLeft/tabs/zweb/zweb.module.scss';

type Entry = {
  icon: Icon,
  title: LangPackKey,
  subtitle?: LangPackKey,
  open: () => void
};

const ZWebSettings = () => {
  const [tab] = useSuperTab();

  const open = (ctor: SliderSuperTabConstructable) => () => {
    tab.slider.createTab(ctor as any).open();
  };

  const link = (url: string) => () => safeWindowOpen(url);

  const entries: Entry[] = [
    {icon: 'settings_filled', title: 'zWeb.General', subtitle: 'zWeb.General.Subtitle', open: open(hotReloadGuard.tabs.AppZWebGeneralTab)},
    {icon: 'appearance_filled', title: 'zWeb.Appearance', subtitle: 'zWeb.Appearance.Subtitle', open: open(hotReloadGuard.tabs.AppZWebAppearanceTab)},
    {icon: 'message_filled', title: 'zWeb.Chats', subtitle: 'zWeb.Chats.Subtitle', open: open(hotReloadGuard.tabs.AppZWebChatsTab)},
    {icon: 'reactions_filled', title: 'zWeb.AyuMoments', subtitle: 'zWeb.AyuMoments.Subtitle', open: open(hotReloadGuard.tabs.AppZWebAyuMomentsTab)},
    {icon: 'apps_magic', title: 'zWeb.Plugins', subtitle: 'zWeb.Plugins.Subtitle', open: open(hotReloadGuard.tabs.AppZWebPluginsTab)}
  ];

  const aboutBtn = ButtonIcon('info', {noRipple: true, ariaLabel: 'zWeb.About' as LangPackKey});

  onMount(() => {
    tab.header.append(aboutBtn);
  });

  onCleanup(() => aboutBtn.remove());

  attachClickEvent(aboutBtn, () => {
    tab.slider.createTab(hotReloadGuard.tabs.AppZWebAboutTab).open();
  }, {listenerSetter: tab.listenerSetter});

  return (
    <>
      <Section name="zWeb">
        <p class={styles.intro}>{i18n('zWeb.Intro')}</p>
      </Section>
      <Section>
        {entries.map((entry) => (
          <Row clickable={entry.open}>
            <Row.Icon icon={entry.icon} />
            <Row.Title>{i18n(entry.title)}</Row.Title>
            <Show when={entry.subtitle}>
              <Row.Subtitle>{i18n(entry.subtitle)}</Row.Subtitle>
            </Show>
          </Row>
        ))}
      </Section>
      <Section>
        <Row clickable={link(ZWEB_DOCS_URL)}>
          <Row.Icon icon="info" />
          <Row.Title>{i18n('zWeb.Docs')}</Row.Title>
          <Row.Subtitle>{i18n('zWeb.Docs.Subtitle')}</Row.Subtitle>
        </Row>
        <Row clickable={link(ZWEB_REPO_URL)}>
          <Row.Icon icon="webview" />
          <Row.Title>GitHub</Row.Title>
          <Row.Subtitle>{i18n('zWeb.GitHub.Subtitle')}</Row.Subtitle>
        </Row>
        <Row clickable={link(ZWEB_AUTHOR_URL)}>
          <Row.Icon icon="message_filled" />
          <Row.Title>@frizovdanya</Row.Title>
          <Row.Subtitle>{i18n('zWeb.Author.Subtitle')}</Row.Subtitle>
        </Row>
      </Section>
      <div class={styles.version}>{ZWEB_NAME} · {getAppVersionText()}</div>
    </>
  );
};

export default ZWebSettings;
