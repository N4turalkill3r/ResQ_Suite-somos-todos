/**
 * ui/dom.js
 * Utilidades mínimas para trabajar con el DOM.
 */

/** Atajo para querySelector. */
export const $ = (selector, root = document) => root.querySelector(selector);

/**
 * Crea un elemento HTML de forma declarativa.
 * Usa textContent/append (nunca innerHTML), por lo que los textos que vienen
 * de GitHub (descripciones, nombres) no pueden inyectar HTML.
 *
 * @param {string} tag       Nombre de la etiqueta.
 * @param {object} [props]   `class`, atributos y eventos (`onclick`, `oninput`…).
 *                           Valores null/false se ignoran; `true` crea un atributo vacío.
 * @param {...any} children  Textos, nodos o arreglos de ellos (null/false se ignoran).
 * @returns {HTMLElement}
 */
export function h(tag, props = {}, ...children) {
  const node = document.createElement(tag);

  for (const [key, value] of Object.entries(props)) {
    if (value == null || value === false) continue;

    if (key === 'class') node.className = value;
    else if (key.startsWith('on') && typeof value === 'function') {
      node.addEventListener(key.slice(2).toLowerCase(), value);
    } else node.setAttribute(key, value === true ? '' : value);
  }

  node.append(...children.flat().filter((child) => child != null && child !== false));
  return node;
}
