import Section from '@components/section';
import Row from '@components/rowTsx';
import {i18n} from '@lib/langPack';
import {getAppVersionText} from '@config/app';
import {ZWEB_AUTHOR_URL, ZWEB_DOCS_URL, ZWEB_NAME, ZWEB_REPO_URL} from '@config/zwebState';
import safeWindowOpen from '@helpers/dom/safeWindowOpen';
import styles from '@components/sidebarLeft/tabs/zweb/zweb.module.scss';

const ZWebAbout = () => {
  return (
    <>
      <img class={styles.logo} src="assets/img/android-chrome-192x192.png" alt="zWeb" />
      <Section name="zWeb">
        <Row>
          <Row.Title>{ZWEB_NAME}</Row.Title>
          <Row.Subtitle>{getAppVersionText()}</Row.Subtitle>
        </Row>
        <Row clickable={() => safeWindowOpen(ZWEB_AUTHOR_URL)}>
          <Row.Icon icon="message_filled" />
          <Row.Title>@frizovdanya</Row.Title>
          <Row.Subtitle>{i18n('zWeb.About.Author')}</Row.Subtitle>
        </Row>
        <Row clickable={() => safeWindowOpen(ZWEB_REPO_URL)}>
          <Row.Icon icon="webview" />
          <Row.Title>GitHub</Row.Title>
          <Row.Subtitle>frizovdanyash/zweb</Row.Subtitle>
        </Row>
        <Row clickable={() => safeWindowOpen(ZWEB_DOCS_URL)}>
          <Row.Icon icon="info" />
          <Row.Title>{i18n('zWeb.Docs')}</Row.Title>
          <Row.Subtitle>{i18n('zWeb.Docs.Subtitle')}</Row.Subtitle>
        </Row>
      </Section>
      <Section name="zWeb.About">
        <p class={styles.intro}>{i18n('zWeb.About.Text')}</p>
      </Section>
    </>
  );
};

export default ZWebAbout;
