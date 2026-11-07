/**
 * zWeb: CSS-переменные, которые настраиваются в разделе «Внешний вид».
 * Значения живут на `<html>` и пересчитываются при изменении настроек.
 */

import {createEffect, createRoot} from 'solid-js';
import {appSettings} from '@stores/appSettings';

export default function applyZWebMarkup() {
  createRoot(() => {
    createEffect(() => {
      const zweb = appSettings.zweb;
      if(!zweb) return;

      const root = document.documentElement;
      const corners = Math.max(0, Math.min(100, zweb.avatarCorners ?? 100));

      // * 50% — круг, 0 — квадрат: промежуточные значения дают мягкое скругление
      root.style.setProperty('--zweb-avatar-radius', (corners / 2) + '%');
      root.classList.toggle('zweb-square-avatars', corners === 0);
      root.classList.toggle('zweb-circle-avatars', corners === 100);

      const radius = Math.max(0, Math.min(100, zweb.sectionRadius ?? 50));
      root.style.setProperty('--zweb-section-radius', (radius / 100 * 16) + 'px');
      root.classList.toggle('zweb-sections-rounded', radius > 0);

      root.classList.toggle('zweb-m3', !!zweb.m3ListItems);
      root.classList.toggle('zweb-no-tail', !!zweb.removeMessageTail);
      root.classList.toggle('zweb-center-title', !!zweb.centerTitle);
      root.classList.toggle('zweb-hide-search', !!zweb.hideSearchBar);
      root.classList.toggle('zweb-hide-stories', !!zweb.hideStories);
      root.classList.toggle('zweb-hide-fab', !!zweb.hideFloatingButton);
      root.classList.toggle('zweb-snow', !!zweb.forceSnow);
    });
  });
}
