/**
 * zWeb: единая точка запуска фирменных функций. Вызывается из `src/index.ts`
 * после того, как аккаунт загружен и менеджеры готовы.
 */

import {startAyuMoments, patchGhostMode} from '@lib/zweb/ayuMoments';
import {bootPlugins} from '@lib/zweb/plugins';
import applyZWebMarkup from '@lib/zweb/markup';

let started = false;

export default function startZWeb() {
  if(started) return;
  started = true;

  try {
    applyZWebMarkup();
  } catch(err) {
    console.error('zWeb: markup', err);
  }

  startAyuMoments();
  patchGhostMode();
  bootPlugins();
}
