/**
 * ui/grid.js
 * Rejilla de tarjetas de herramientas.
 * Funciones puras de presentación: reciben datos y callbacks, no conocen el store.
 */

import { h } from './dom.js';
import { MAX_TAGS_PER_CARD } from '../config.js';

/** Etiquetas de la tarjeta: "Nuevo", "privado" y los primeros topics. */
function createTags(tool, isFresh) {
  return h(
    'div',
    { class: 'card__tags' },
    isFresh && h('span', { class: 'tag tag--new' }, 'Nuevo'),
    tool.isPrivate && h('span', { class: 'tag' }, 'privado'),
    tool.topics.slice(0, MAX_TAGS_PER_CARD).map((topic) => h('span', { class: 'tag' }, topic)),
  );
}

/** Botón principal: abre la herramienta, o queda deshabilitado si no tiene página. */
function createOpenButton(tool, onOpen) {
  return tool.url
    ? h('button', { class: 'btn btn--primary', type: 'button', onclick: () => onOpen(tool) }, 'Abrir')
    : h('button', { class: 'btn', type: 'button', disabled: true }, 'Sin página web');
}

/**
 * Crea una tarjeta.
 * @param {object} tool
 * @param {{isFavorite: boolean, isFresh: boolean}} flags
 * @param {{onOpen: Function, onToggleFavorite: Function, onSupport: Function}} handlers
 */
function createCard(tool, { isFavorite, isFresh }, handlers) {
  return h(
    'article',
    { class: 'card' },
    h(
      'div',
      { class: 'card__head' },
      h('div', { class: 'card__avatar', 'aria-hidden': 'true' }, (tool.name[0] || '?').toUpperCase()),
      h('h2', { class: 'card__name' }, tool.name),
      h(
        'button',
        {
          class: `card__fav${isFavorite ? ' is-on' : ''}`,
          type: 'button',
          'aria-pressed': String(isFavorite),
          'aria-label': isFavorite ? 'Quitar de favoritas' : 'Marcar como favorita',
          onclick: () => handlers.onToggleFavorite(tool.id),
        },
        isFavorite ? '★' : '☆',
      ),
    ),
    h('p', { class: 'card__desc' }, tool.description || 'Sin descripción'),
    createTags(tool, isFresh),
    h(
      'div',
      { class: 'card__actions' },
      createOpenButton(tool, handlers.onOpen),
      h(
        'button',
        { class: 'btn btn--ghost', type: 'button', onclick: () => handlers.onSupport(tool) },
        '♥ Apoya al desarrollador',
      ),
    ),
  );
}

/**
 * Redibuja la rejilla completa.
 * @param {HTMLElement} container
 * @param {{tools: object[], hasTools: boolean, favoriteIds: number[], freshIds: number[]}} data
 * @param {object} handlers
 */
export function renderGrid(container, { tools, hasTools, favoriteIds, freshIds }, handlers) {
  if (tools.length === 0) {
    const message = hasTools
      ? 'Nada coincide con tu búsqueda.'
      : 'Aún no hay herramientas. Abre ⚙ y escribe tu usuario de GitHub.';
    container.replaceChildren(h('p', { class: 'tool-grid__empty' }, message));
    return;
  }

  container.replaceChildren(
    ...tools.map((tool) =>
      createCard(
        tool,
        { isFavorite: favoriteIds.includes(tool.id), isFresh: freshIds.includes(tool.id) },
        handlers,
      ),
    ),
  );
}
