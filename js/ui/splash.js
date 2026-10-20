/**
 * ui/splash.js
 * Pantalla de bienvenida con el sello animado (la animación vive en splash.css).
 * Se muestra una vez por sesión; se cierra sola o al tocar / pulsar una tecla.
 */

import { $ } from './dom.js';
import { SPLASH_DURATION_MS, STORAGE_KEYS } from '../config.js';
import { SPLASH_NOTE } from '../content.js';
import { session } from '../services/storage.js';

const FADE_OUT_MS = 400; // debe coincidir con la transición de .splash en splash.css

/**
 * Muestra la bienvenida si aún no se vio en esta sesión.
 * @returns {Promise<void>} Se resuelve cuando la pantalla terminó de cerrarse.
 */
export function showSplash() {
  if (session.get(STORAGE_KEYS.splashShown, false)) return Promise.resolve();
  session.set(STORAGE_KEYS.splashShown, true);

  const root = $('#splash');
  $('#splashNote').textContent = SPLASH_NOTE;
  root.hidden = false;
  root.focus();

  return new Promise((resolve) => {
    let finished = false;

    function finish() {
      if (finished) return; // evita doble cierre (toque + temporizador)
      finished = true;
      clearTimeout(autoCloseTimer);
      root.classList.add('is-leaving');
      setTimeout(() => {
        root.hidden = true;
        resolve();
      }, FADE_OUT_MS);
    }

    const autoCloseTimer = setTimeout(finish, SPLASH_DURATION_MS);
    root.addEventListener('click', finish);
    root.addEventListener('keydown', finish);
  });
}
