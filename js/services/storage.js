/**
 * services/storage.js
 * Envoltorio seguro sobre localStorage / sessionStorage.
 *
 * Los navegadores pueden lanzar errores al acceder al almacenamiento
 * (modo privado, cuota llena, datos bloqueados). Aquí se capturan para que
 * el resto de la app nunca tenga que preocuparse por ello.
 */

/**
 * Crea un almacén con lectura/escritura JSON tolerante a fallos.
 * @param {() => Storage} getBackend Función que devuelve el Storage real.
 */
function createStorage(getBackend) {
  return {
    /** Lee y parsea un valor; devuelve `fallback` si no existe o falla. */
    get(key, fallback) {
      try {
        const raw = getBackend().getItem(key);
        return raw === null ? fallback : JSON.parse(raw);
      } catch {
        return fallback;
      }
    },

    /** Guarda un valor como JSON; devuelve true si se pudo guardar. */
    set(key, value) {
      try {
        getBackend().setItem(key, JSON.stringify(value));
        return true;
      } catch {
        return false;
      }
    },
  };
}

/** Persistente entre sesiones. */
export const local = createStorage(() => window.localStorage);

/** Dura solo mientras la pestaña/app esté abierta. */
export const session = createStorage(() => window.sessionStorage);
