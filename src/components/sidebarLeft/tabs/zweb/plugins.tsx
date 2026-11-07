import {createSignal, For, onMount, Show} from 'solid-js';
import Section from '@components/section';
import Row from '@components/rowTsx';
import CheckboxFieldTsx from '@components/checkboxFieldTsx';
import I18n, {i18n, LangPackKey} from '@lib/langPack';
import {useAppSettings} from '@stores/appSettings';
import {toastNew} from '@components/toast';
import confirmationPopup from '@components/confirmationPopup';
import ButtonIcon from '@components/buttonIcon';
import {attachClickEvent} from '@helpers/dom/clickEvent';
import {useSuperTab} from '@components/solidJsTabs/superTabProvider';
import {
  ALL_PERMISSIONS, clearLogs, getGrant, getLogs, getPlugins, installPlugin, isPluginActive,
  PERMISSION_TITLES, PluginPermission, pushLog, reloadPlugin, setGrant, subscribePlugins, uninstallPlugin
} from '@lib/zweb/plugins';
import {ZWEB_DOCS_URL} from '@config/zwebState';
import safeWindowOpen from '@helpers/dom/safeWindowOpen';
import styles from '@components/sidebarLeft/tabs/zweb/zweb.module.scss';

const ZWebPlugins = () => {
  const [tab] = useSuperTab();
  const [appSettings, setAppSettings] = useAppSettings();
  const [version, setVersion] = createSignal(0);
  const [expanded, setExpanded] = createSignal<string>();

  onMount(() => subscribePlugins(() => setVersion(version() + 1)));

  const plugins = () => {
    version();
    return getPlugins();
  };
  const logs = () => {
    version();
    return getLogs().slice(-40).reverse();
  };

  const grantKey = (permission: PluginPermission) => permission === 'messages.read' ? 'messagesRead' :
    permission === 'messages.send' ? 'messagesSend' : permission;

  const install = (code: string, source: 'file' | 'url' | 'paste', url?: string) => {
    try {
      const plugin = installPlugin(code, source, url);
      toastNew({langPackKey: 'zWeb.Plugins.Reloaded'});
      setVersion(version() + 1);
      return plugin;
    } catch(err) {
      toastNew({langPackKey: 'zWeb.Plugins.InstallError'});
    }
  };

  const onPickFile = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.js,.plugin,.mjs,.txt,text/javascript';
    input.addEventListener('change', () => {
      const file = input.files?.[0];
      if(!file) return;
      const reader = new FileReader();
      reader.onload = () => install(String(reader.result), 'file');
      reader.readAsText(file);
    });
    input.click();
  };

  const installFromUrl = () => {
    import('@components/popups/zwebInput').then(({default: showZWebInputPopup}) => {
      showZWebInputPopup({
        titleLangKey: 'zWeb.Plugins.FromUrl',
        placeholder: 'https://example.com/plugin.js',
        value: '',
        onChange: async(url) => {
          if(!url) return;
          try {
            const code = await (await fetch(url)).text();
            install(code, 'url', url);
          } catch(err) {
            toastNew({langPackKey: 'zWeb.Plugins.InstallError'});
          }
        }
      });
    });
  };

  const installFromPaste = () => {
    import('@components/popups/zwebCode').then(({default: showZWebCodePopup}) => {
      showZWebCodePopup({
        title: I18n.format('zWeb.Plugins.FromCode', true),
        onInstall: (code) => install(code, 'paste')
      });
    });
  };

  const docsBtn = ButtonIcon('info', {noRipple: true, ariaLabel: 'zWeb.Docs' as LangPackKey});
  onMount(() => tab.header.append(docsBtn));
  attachClickEvent(docsBtn, () => safeWindowOpen(ZWEB_DOCS_URL), {listenerSetter: tab.listenerSetter});

  return (
    <>
      <Section name="zWeb.Plugins.Engine" caption="zWeb.Plugins.Engine.Info">
        <Row>
          <Row.CheckboxFieldToggle>
            <CheckboxFieldTsx
              toggle
              checked={appSettings.zweb.pluginsEnabled}
              onChange={(value) => {
                setAppSettings('zweb', 'pluginsEnabled', value);
                pushLog({pluginId: '*', kind: 'info', text: value ? 'Движок включён' : 'Движок выключен'});
              }}
            />
          </Row.CheckboxFieldToggle>
          <Row.Title>{i18n('zWeb.Plugins.Enabled')}</Row.Title>
        </Row>
        <Row>
          <Row.CheckboxFieldToggle>
            <CheckboxFieldTsx
              toggle
              checked={appSettings.zweb.pluginsSafeMode}
              onChange={(value) => {
                setAppSettings('zweb', 'pluginsSafeMode', value);
                pushLog({pluginId: '*', kind: 'info', text: value ? 'Безопасный режим включён' : 'Безопасный режим выключен'});
                if(!value) import('@lib/zweb/plugins').then(({bootPlugins}) => bootPlugins());
              }}
            />
          </Row.CheckboxFieldToggle>
          <Row.Title>{i18n('zWeb.Plugins.SafeMode')}</Row.Title>
          <Row.Subtitle>{i18n('zWeb.Plugins.SafeMode.Info')}</Row.Subtitle>
        </Row>
        <Row>
          <Row.CheckboxFieldToggle>
            <CheckboxFieldTsx
              toggle
              checked={appSettings.zweb.pluginsUnsafeMode}
              onChange={(value) => setAppSettings('zweb', 'pluginsUnsafeMode', value)}
            />
          </Row.CheckboxFieldToggle>
          <Row.Title>{i18n('zWeb.Plugins.UnsafeMode')}</Row.Title>
          <Row.Subtitle>{i18n('zWeb.Plugins.UnsafeMode.Info')}</Row.Subtitle>
        </Row>
      </Section>

      <Section name="zWeb.Plugins.Install">
        <Row clickable={onPickFile}>
          <Row.Icon icon="add" />
          <Row.Title>{i18n('zWeb.Plugins.FromFile')}</Row.Title>
          <Row.Subtitle>{i18n('zWeb.Plugins.FromFile.Info')}</Row.Subtitle>
        </Row>
        <Row clickable={installFromUrl}>
          <Row.Icon icon="link" />
          <Row.Title>{i18n('zWeb.Plugins.FromUrl')}</Row.Title>
          <Row.Subtitle>{i18n('zWeb.Plugins.FromUrl.Info')}</Row.Subtitle>
        </Row>
        <Row clickable={installFromPaste}>
          <Row.Icon icon="attach_edit" />
          <Row.Title>{i18n('zWeb.Plugins.FromCode')}</Row.Title>
          <Row.Subtitle>{i18n('zWeb.Plugins.FromCode.Info')}</Row.Subtitle>
        </Row>
        <Row clickable={() => safeWindowOpen(ZWEB_DOCS_URL)}>
          <Row.Icon icon="info" />
          <Row.Title>{i18n('zWeb.Docs')}</Row.Title>
          <Row.Subtitle>{i18n('zWeb.Plugins.Docs.Info')}</Row.Subtitle>
        </Row>
      </Section>

      <Section name="zWeb.Plugins.Installed" caption={plugins().length ? undefined : 'zWeb.Plugins.Empty'}>
        <For each={plugins()}>{(plugin) => {
          const grant = () => {
            version();
            return getGrant(plugin.id);
          };
          const isOpen = () => expanded() === plugin.id;

          return (
            <>
              <Row clickable={() => setExpanded(isOpen() ? undefined : plugin.id)}>
                <Row.CheckboxFieldToggle>
                  <CheckboxFieldTsx
                    toggle
                    checked={grant().enabled}
                    onChange={(value) => {
                      setGrant(plugin.id, {enabled: value});
                      if(value) reloadPlugin(plugin.id).catch(() => {});
                      else import('@lib/zweb/plugins').then(({unloadPlugin}) => unloadPlugin(plugin.id));
                      setVersion(version() + 1);
                    }}
                  />
                </Row.CheckboxFieldToggle>
                <Row.Title>
                  {plugin.name}
                  <span class={styles.pluginVersion}> {plugin.version}</span>
                </Row.Title>
                <Row.Subtitle>{plugin.description || plugin.id}</Row.Subtitle>
              </Row>
              <Show when={isOpen()}>
                <Row>
                  <Row.Icon icon="info" />
                  <Row.Title>{i18n('zWeb.Plugins.Author')}</Row.Title>
                  <Row.Subtitle>{plugin.author} · {new Date(plugin.installedAt).toLocaleDateString()}</Row.Subtitle>
                </Row>
                <For each={ALL_PERMISSIONS}>{(permission) => (
                  <Row>
                    <Row.CheckboxFieldToggle>
                      <CheckboxFieldTsx
                        toggle
                        checked={(grant() as any)[grantKey(permission)]}
                        onChange={(value) => {
                          setGrant(plugin.id, {[grantKey(permission)]: value} as any);
                          setVersion(version() + 1);
                          if(isPluginActive(plugin.id)) reloadPlugin(plugin.id).catch(() => {});
                        }}
                      />
                    </Row.CheckboxFieldToggle>
                    <Row.Title>{PERMISSION_TITLES[permission]}</Row.Title>
                  </Row>
                )}</For>
                <Row clickable={() => {
                  reloadPlugin(plugin.id).then(
                    () => toastNew({langPackKey: 'zWeb.Plugins.Reloaded'}),
                    () => toastNew({langPackKey: 'zWeb.Plugins.InstallError'})
                  );
                }}>
                  <Row.Icon icon="reload_star" />
                  <Row.Title>{i18n('zWeb.Plugins.Reload')}</Row.Title>
                </Row>
                <Row clickable={async() => {
                  try {
                    await confirmationPopup({
                      titleLangKey: 'zWeb.Plugins.Delete',
                      descriptionLangKey: 'zWeb.Plugins.Delete',
                      button: {langKey: 'Delete', isDanger: true}
                    });
                  } catch(err) {
                    return;
                  }
                  uninstallPlugin(plugin.id);
                  setVersion(version() + 1);
                }}>
                  <Row.Icon icon="delete_filled" />
                  <Row.Title>{i18n('zWeb.Plugins.Delete')}</Row.Title>
                </Row>
              </Show>
            </>
          );
        }}</For>
      </Section>

      <Section name="zWeb.Plugins.Logs">
        <For each={logs()}>{(entry) => (
          <Row>
            <Row.Title>{entry.kind} · {entry.pluginId}</Row.Title>
            <Row.Subtitle>{new Date(entry.time).toLocaleTimeString()} — {entry.text}</Row.Subtitle>
          </Row>
        )}</For>
        <Row clickable={() => {
          clearLogs();
          setVersion(version() + 1);
        }}>
          <Row.Icon icon="delete" />
          <Row.Title>{i18n('zWeb.Plugins.ClearLogs')}</Row.Title>
        </Row>
      </Section>
    </>
  );
};

export default ZWebPlugins;
