import PopupElement, {createPopup} from '@components/popups/indexTsx';
import {createSignal} from 'solid-js';
import {i18n} from '@lib/langPack';
import InputField from '@components/inputField';

/** Установка плагина из вставленного текста. */
export default function showZWebCodePopup(options: {
  title: string,
  onInstall: (code: string) => void
}): void {
  createPopup(() => {
    const [show, setShow] = createSignal(true);

    const field = new InputField({
      label: options.title as any,
      name: 'zweb-plugin-code',
      plainText: true
    });
    field.input.classList.add('zweb-plugin-code-input');
    field.input.setAttribute('contenteditable', 'plaintext-only');

    const install = () => {
      const code = field.value;
      if(!code.trim()) return;
      options.onInstall(code);
      setShow(false);
    };

    return (
      <PopupElement class="zweb-code-popup" show={show()} closable>
        <PopupElement.Header>
          <PopupElement.CloseButton />
          <PopupElement.Title title={options.title as any} />
          <button class="btn-primary btn-color-primary" onClick={install}>{i18n('zWeb.Plugins.Install')}</button>
        </PopupElement.Header>
        <PopupElement.Body>{field.container}</PopupElement.Body>
      </PopupElement>
    );
  });
}
