/**
 * config.js
 * Constantes de la aplicación. Aquí no hay lógica: solo valores que se
 * pueden ajustar sin tocar el resto del código.
 */

export const APP_NAME = 'ResQ Suite';

/** Correo de contacto para quienes quieran apoyar el proyecto. */
export const CONTACT_EMAIL = 'Bryan.a.coreas@gmail.com';

/**
 * Claves de almacenamiento. Llevan prefijo "resq." para no chocar con otras
 * apps publicadas en el mismo dominio (p. ej. github.io).
 */
export const STORAGE_KEYS = Object.freeze({
  config: 'resq.config',
  tools: 'resq.tools',
  seen: 'resq.seen',
  fresh: 'resq.fresh',
  favorites: 'resq.favorites',
  lastSync: 'resq.lastSync',
  splashShown: 'resq.splashShown', // se guarda en sessionStorage
});

/** Ajustes del usuario: valores iniciales. */
export const DEFAULT_CONFIG = Object.freeze({
  user: 'N4turalkill3r', // usuario de GitHub predeterminado; se puede cambiar en ⚙ Ajustes
  topic: '', // si se indica, solo se listan repos con este topic
  token: '', // opcional: repos privados y más cuota de consultas
});

/** Parámetros de sincronización con GitHub. */
export const SYNC = Object.freeze({
  minIntervalMs: 5 * 60 * 1000, // al volver a la app, no consultar más de 1 vez cada 5 min
  perPage: 100,
  maxPages: 10,
});

/** Tiempo que permanece la pantalla de bienvenida (se puede cerrar tocando). */
export const SPLASH_DURATION_MS = 6500;

/** Filtros fijos de la barra de chips; los topics se agregan dinámicamente. */
export const BASE_FILTERS = Object.freeze([
  { id: 'all', label: 'Todas' },
  { id: 'app', label: 'Con página' },
  { id: 'fav', label: '★ Favoritas' },
]);

/** Prefijo para distinguir los filtros por topic de los filtros fijos. */
export const TOPIC_FILTER_PREFIX = 'topic:';

/** Máximo de etiquetas (topics) visibles por tarjeta. */
export const MAX_TAGS_PER_CARD = 4;
