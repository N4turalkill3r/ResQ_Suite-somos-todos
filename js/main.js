/**
 * main.js
 * Punto de entrada: crea los componentes de la UI, los conecta con el store
 * y arranca la app. Aquí NO hay lógica de negocio, solo "cableado".
 */

import { $ } from './ui/dom.js';
import { initHeader, renderHeader } from './ui/header.js';
import { renderGrid } from './ui/grid.js';
import { createSettingsDialog } from './ui/settings-dialog.js';
import { createSupportDialog } from './ui/support-dialog.js';
import { showSplash } from './ui/splash.js';
import {
  getState,
  subscribe,
  setQuery,
  setFilter,
  toggleFavorite,
  markAsOpened,
  saveConfig,
  syncTools,
  needsSync,
  isConfigured,
  getTopics,
  getVisibleTools,
} from './state/store.js';

function start() {
  /* ---- Componentes ---- */
  const supportDialog = createSupportDialog();
  const settingsDialog = createSettingsDialog({
    onSave(config) {
      saveConfig(config);
      syncTools();
    },
  });

  /* ---- Acciones que disparan las tarjetas ---- */
  const cardHandlers = {
    /**
     * La herramienta se abre en una pestaña propia del navegador (no dentro
     * de la suite): así conserva todas sus funciones, como proyección,
     * pantalla completa y cámara, que un iframe bloquearía.
     */
    onOpen(tool) {
      window.open(tool.url, '_blank', 'noopener');
      markAsOpened(tool.id);
    },
    onToggleFavorite: toggleFavorite,
    onSupport: (tool) => supportDialog.open(tool.name),
  };

  /* ---- Render: la UI se redibuja siempre a partir del estado ---- */
  function render(state = getState()) {
    renderHeader(state, getTopics(), setFilter);
    renderGrid(
      $('#grid'),
      {
        tools: getVisibleTools(),
        hasTools: state.tools.length > 0,
        favoriteIds: state.favoriteIds,
        freshIds: state.freshIds,
      },
      cardHandlers,
    );
  }

  subscribe(render);

  initHeader({
    onSearch: setQuery,
    onRefresh: syncTools,
    onOpenSettings: () => settingsDialog.open(getState().config),
  });

  // Auto-actualización: al volver a la app se revisa si hay herramientas nuevas.
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && isConfigured() && needsSync()) syncTools();
  });

  /* ---- Arranque ---- */
  render(); // pinta de inmediato lo guardado de la última vez
  boot(settingsDialog);

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {
      /* sin service worker la app funciona igual, solo sin modo offline */
    });
  }
}

/**
 * Muestra la bienvenida y sincroniza en paralelo (así la lista ya está
 * lista cuando el sello termina). Si faltan ajustes, los pide después.
 */
async function boot(settingsDialog) {
  const [, { needsConfig }] = await Promise.all([showSplash(), syncTools()]);
  if (needsConfig) settingsDialog.open(getState().config);
}

start();
