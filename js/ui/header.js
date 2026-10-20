/**
 * ui/header.js
 * Encabezado: buscador, botones, chips de filtro y línea de estado.
 */

import { $, h } from './dom.js';
import { BASE_FILTERS, TOPIC_FILTER_PREFIX } from '../config.js';

/**
 * Conecta los controles estáticos del encabezado (se llama una sola vez).
 * @param {{onSearch: (text: string) => void, onRefresh: () => void, onOpenSettings: () => void}} handlers
 */
export function initHeader({ onSearch, onRefresh, onOpenSettings }) {
  $('#search').addEventListener('input', (event) => onSearch(event.target.value));
  $('#btnRefresh').addEventListener('click', onRefresh);
  $('#btnSettings').addEventListener('click', onOpenSettings);
}

/** Dibuja los chips: filtros fijos + un chip por cada topic existente. */
function renderChips(activeFilter, topics, onSelect) {
  const options = [
    ...BASE_FILTERS,
    ...topics.map((topic) => ({ id: `${TOPIC_FILTER_PREFIX}${topic}`, label: `#${topic}` })),
  ];

  $('#chips').replaceChildren(
    ...options.map((option) => {
      const isActive = option.id === activeFilter;
      return h(
        'button',
        {
          class: `chip${isActive ? ' is-active' : ''}`,
          type: 'button',
          'aria-pressed': String(isActive),
          onclick: () => onSelect(option.id),
        },
        option.label,
      );
    }),
  );
}

/** Muestra el mensaje de estado (ok o error). */
function renderStatus({ text, isError }) {
  const status = $('#status');
  status.textContent = text;
  status.classList.toggle('is-error', isError);
}

/**
 * Redibuja la parte dinámica del encabezado.
 * @param {{filter: string, status: {text: string, isError: boolean}}} state
 * @param {string[]} topics
 * @param {(filterId: string) => void} onFilter
 */
export function renderHeader(state, topics, onFilter) {
  renderChips(state.filter, topics, onFilter);
  renderStatus(state.status);
}
