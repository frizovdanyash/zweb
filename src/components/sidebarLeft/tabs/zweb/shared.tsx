import {Show} from 'solid-js';
import Row from '@components/rowTsx';
import CheckboxFieldTsx from '@components/checkboxFieldTsx';
import RadioFieldTsx from '@components/radioFieldTsx';
import {i18n, LangPackKey} from '@lib/langPack';
import {useAppSettings} from '@stores/appSettings';
import {ZWebState} from '@config/zwebState';

export type ZWebKey = keyof ZWebState;

/** Переключатель настройки zWeb: подпись, подпись-описание, тумблер. */
export const ZToggle = (props: {
  key: ZWebKey,
  title: LangPackKey,
  subtitle?: LangPackKey
}) => {
  const [appSettings, setAppSettings] = useAppSettings();
  return (
    <Row>
      <Row.CheckboxFieldToggle>
        <CheckboxFieldTsx
          toggle
          checked={!!(appSettings.zweb as any)[props.key]}
          onChange={(value) => setAppSettings('zweb', props.key as any, value as any)}
        />
      </Row.CheckboxFieldToggle>
      <Row.Title>{i18n(props.title)}</Row.Title>
      <Show when={props.subtitle}>
        <Row.Subtitle>{i18n(props.subtitle)}</Row.Subtitle>
      </Show>
    </Row>
  );
};

/** Группа радиокнопок, привязанная к строковой настройке. */
export const ZRadioGroup = <T extends string>(props: {
  key: ZWebKey,
  values: {value: T, title: LangPackKey, subtitle?: LangPackKey}[],
  name?: string
}) => {
  const [appSettings, setAppSettings] = useAppSettings();
  const current = () => (appSettings.zweb as any)[props.key] as T;

  return (
    <>
      {props.values.map((item) => (
        <Row>
          <Row.RadioField>
            <RadioFieldTsx
              name={props.name || ('zweb-' + props.key)}
              value={item.value}
              checked={current() === item.value}
              onChange={(checked) => checked && setAppSettings('zweb', props.key as any, item.value as any)}
            />
          </Row.RadioField>
          <Row.Title>{i18n(item.title)}</Row.Title>
          <Show when={item.subtitle}>
            <Row.Subtitle>{i18n(item.subtitle)}</Row.Subtitle>
          </Show>
        </Row>
      ))}
    </>
  );
};
