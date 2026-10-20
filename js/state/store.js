/**
 * state/store.js
 * Única fuente de verdad de la app: estado, acciones y selectores.
 *
 * Patrón: la UI NUNCA modifica el estado directamente; llama a una acción
 * (setQuery, toggleFavorite, syncTools…) y se entera del cambio mediante
 * `subscribe`. Así el flujo de datos siempre va en una sola dirección:
 *
 *    acción  →  estado  →  render de la UI
 */

import { local } from '../services/storage.js';
import {
  fetchRepositories,
  selectToolRepos,
  repoToTool,
  GitHubError,
} from '../services/github.js';
import {
  STORAGE_KEYS,
  DEFAULT_CONFIG,
  SYNC,
  TOPIC_FILTER_PREFIX,
} from '../config.js';

/* --------------------------------------------------------------------------
 * Estado
 * ------------------------------------------------------------------------ */

const state = {
  // Persistente
  config: { ...DEFAULT_CONFIG, ...local.get(STORAGE_KEYS.config, {}) },
  tools: local.get(STORAGE_KEYS.tools, []),
  seenIds: local.get(STORAGE_KEYS.seen, null), // null = aún no se ha sincronizado nunca
  freshIds: local.get(STORAGE_KEYS.fresh, []), // herramientas nuevas sin abrir
  favoriteIds: local.get(STORAGE_KEYS.favorites, []),
  lastSync: local.get(STORAGE_KEYS.lastSync, 0),

  // De sesión (no se guarda)
  filter: 'all',
  query: '',
  status: { text: '', isError: false },
};

const listeners = new Set();
let isSyncing = false;

/** Estado actual (solo lectura por convención). */
export const getState = () => state;

/** Registra un oyente que se ejecuta en cada cambio. Devuelve la función para darse de baja. */
export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Aplica un cambio parcial y notifica a los oyentes. */
function update(patch) {
  Object.assign(state, patch);
  listeners.forEach((listener) => listener(state));
}

const setStatus = (text, isError = false) => update({ status: { text, isError } });

/* --------------------------------------------------------------------------
 * Acciones de interfaz
 * ------------------------------------------------------------------------ */

export const setQuery = (query) => update({ query });
export const setFilter = (filter) => update({ filter });

export function toggleFavorite(toolId) {
  const favoriteIds = state.favoriteIds.includes(toolId)
    ? state.favoriteIds.filter((id) => id !== toolId)
    : [...state.favoriteIds, toolId];
  local.set(STORAGE_KEYS.favorites, favoriteIds);
  update({ favoriteIds });
}

/** Quita la etiqueta "Nuevo" de una herramienta al abrirla. */
export function markAsOpened(toolId) {
  if (!state.freshIds.includes(toolId)) return;
  const freshIds = state.freshIds.filter((id) => id !== toolId);
  local.set(STORAGE_KEYS.fresh, freshIds);
  update({ freshIds });
}

/** Guarda los ajustes y reinicia la lista (para no marcar todo como "nuevo"). */
export function saveConfig(config) {
  local.set(STORAGE_KEYS.config, config);
  local.set(STORAGE_KEYS.tools, []);
  local.set(STORAGE_KEYS.seen, null);
  local.set(STORAGE_KEYS.fresh, []);
  update({ config, tools: [], seenIds: null, freshIds: [], filter: 'all' });
}

/* --------------------------------------------------------------------------
 * Sincronización con GitHub
 * ------------------------------------------------------------------------ */

/** ¿Pasó el tiempo mínimo desde la última sincronización? */
export const needsSync = () => Date.now() - state.lastSync > SYNC.minIntervalMs;

/** ¿Hay credenciales suficientes para consultar GitHub? */
export const isConfigured = () => Boolean(state.config.user || state.config.token);

/**
 * La propia suite también es un repo con GitHub Pages: se excluye para que
 * no aparezca como herramienta ni se abra a sí misma dentro del visor.
 */
function isCurrentApp(tool) {
  if (!tool.url) return false;
  try {
    const normalize = (url) => new URL(url, location.href).href.replace(/\/?$/, '/');
    return normalize(tool.url) === normalize('./');
  } catch {
    return false;
  }
}

/**
 * Detecta herramientas que no existían en la sincronización anterior.
 * En la primera sincronización nada se marca como nuevo.
 */
function detectFreshIds(tools, seenIds, previousFreshIds) {
  if (seenIds === null) return previousFreshIds;
  const known = new Set(seenIds);
  const current = new Set(tools.map((tool) => tool.id));
  const added = tools.filter((tool) => !known.has(tool.id)).map((tool) => tool.id);
  return [...new Set([...previousFreshIds, ...added])].filter((id) => current.has(id));
}

function buildSuccessMessage(toolCount, freshCount, timestamp) {
  const time = new Date(timestamp).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
  const fresh = freshCount ? ` · ${freshCount} nueva${freshCount > 1 ? 's' : ''}` : '';
  return `${toolCount} herramientas · actualizado ${time}${fresh}`;
}

function buildErrorMessage(error) {
  const base = error instanceof GitHubError ? error.message : 'No hay conexión con GitHub.';
  return state.tools.length ? `${base} Mostrando la copia guardada.` : base;
}

/**
 * Consulta GitHub y actualiza la lista de herramientas.
 * @returns {Promise<{needsConfig: boolean}>} needsConfig=true si faltan los ajustes.
 */
export async function syncTools() {
  if (!isConfigured()) return { needsConfig: true };
  if (isSyncing) return { needsConfig: false };

  isSyncing = true;
  setStatus('Buscando herramientas…');

  try {
    const { user, token, topic } = state.config;
    const repos = await fetchRepositories({ user, token });
    const tools = selectToolRepos(repos, topic).map(repoToTool).filter((tool) => !isCurrentApp(tool));

    const freshIds = detectFreshIds(tools, state.seenIds, state.freshIds);
    const seenIds = tools.map((tool) => tool.id);
    const lastSync = Date.now();

    local.set(STORAGE_KEYS.tools, tools);
    local.set(STORAGE_KEYS.seen, seenIds);
    local.set(STORAGE_KEYS.fresh, freshIds);
    local.set(STORAGE_KEYS.lastSync, lastSync);

    // Si el topic elegido en el filtro ya no existe, vuelve a "Todas".
    const topics = collectTopics(tools);
    const filterIsStale =
      state.filter.startsWith(TOPIC_FILTER_PREFIX) &&
      !topics.includes(state.filter.slice(TOPIC_FILTER_PREFIX.length));

    update({
      tools,
      seenIds,
      freshIds,
      lastSync,
      filter: filterIsStale ? 'all' : state.filter,
      status: { text: buildSuccessMessage(tools.length, freshIds.length, lastSync), isError: false },
    });
  } catch (error) {
    setStatus(buildErrorMessage(error), true);
  } finally {
    isSyncing = false;
  }

  return { needsConfig: false };
}

/* --------------------------------------------------------------------------
 * Selectores (datos derivados del estado)
 * ------------------------------------------------------------------------ */

function collectTopics(tools) {
  return [...new Set(tools.flatMap((tool) => tool.topics))].sort();
}

/** Topics disponibles para generar los chips de filtro. */
export const getTopics = () => collectTopics(state.tools);

function matchesFilter(tool) {
  const { filter, favoriteIds } = state;
  if (filter === 'all') return true;
  if (filter === 'app') return Boolean(tool.url);
  if (filter === 'fav') return favoriteIds.includes(tool.id);
  if (filter.startsWith(TOPIC_FILTER_PREFIX)) {
    return tool.topics.includes(filter.slice(TOPIC_FILTER_PREFIX.length));
  }
  return true;
}

function matchesQuery(tool) {
  const query = state.query.trim().toLowerCase();
  if (!query) return true;
  return `${tool.name} ${tool.description} ${tool.topics.join(' ')}`.toLowerCase().includes(query);
}

/**
 * Herramientas visibles según búsqueda y filtro.
 * Orden: favoritas → nuevas → más recientemente actualizadas.
 */
export function getVisibleTools() {
  const { favoriteIds, freshIds } = state;
  const rank = (tool) => (favoriteIds.includes(tool.id) ? 2 : 0) + (freshIds.includes(tool.id) ? 1 : 0);

  return state.tools
    .filter((tool) => matchesFilter(tool) && matchesQuery(tool))
    .sort((a, b) => rank(b) - rank(a) || new Date(b.updatedAt) - new Date(a.updatedAt));
}
