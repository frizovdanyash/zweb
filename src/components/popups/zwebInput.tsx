import PopupElement, {createPopup} from '@components/popups/indexTsx';
import {createSignal} from 'solid-js';
import InputField from '@components/inputField';
import {i18n, LangPackKey} from '@lib/langPack';

/**
 * Небольшой попап «введите значение» для настроек zWeb: тот же вид, что у
 * остальных диалогов приложения, но без отдельного экрана под каждую строку.
 */
export default function showZWebInputPopup(options: {
  titleLangKey?: LangPackKey,
  descriptionLangKey?: LangPackKey,
  placeholder?: string,
  value: string,
  maxLength?: number,
  onChange: (value: string) => void
}): void {
  createPopup(() => {
    const [show, setShow] = createSignal(true);

    const field = new InputField({
      label: options.titleLangKey,
      placeholder: options.placeholder as any,
      maxLength: options.maxLength,
      name: 'zweb-input-popup',
      plainText: true
    });
    field.setValueSilently(options.value ?? '');
    field.container.classList.add('input-field-input-wrapper');

    const confirm = () => {
      options.onChange(field.value.trim());
      setShow(false);
    };

    field.input.addEventListener('keydown', (e) => {
      if(e.key === 'Enter') {
        e.preventDefault();
        confirm();
      }
    });

    return (
      <PopupElement class="zweb-input-popup" show={show()} closable>
        <PopupElement.Header>
          <PopupElement.CloseButton />
          <PopupElement.Title title={options.titleLangKey} />
          <button class="btn-primary btn-color-primary" onClick={confirm}>{i18n('Save')}</button>
        </PopupElement.Header>
        <PopupElement.Body>
          {field.container}
          {options.descriptionLangKey && (
            <p class="zweb-input-popup-description">{i18n(options.descriptionLangKey)}</p>
          )}
        </PopupElement.Body>
      </PopupElement>
    );
  });
}
