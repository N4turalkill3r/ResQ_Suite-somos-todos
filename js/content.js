/**
 * content.js
 * Textos editoriales de la app (bienvenida y nota de apoyo).
 * Están separados de la lógica para poder reescribirlos sin riesgo.
 */

import { APP_NAME } from './config.js';

/** Nota que acompaña al sello en la pantalla de bienvenida. */
export const SPLASH_NOTE =
  'Este proyecto se desarrolla con fondos propios. ' +
  `Espero que ${APP_NAME} te sea de utilidad en tus actividades diarias. ` +
  'Recuerda que también puedes apoyar al PM.';

/**
 * Nota del botón "Apoya al desarrollador".
 *
 * Intención del texto (persuasión honesta, sin presión):
 *  1. Reciprocidad: muestra el esfuerzo real detrás de cada herramienta.
 *  2. Pertenencia: "esta suite también es tuya", se invita a formar parte.
 *  3. Esfuerzo mínimo + efecto colectivo: un "granito de arena" que suma.
 *  4. Autonomía: aclara que no es una obligación (reduce la resistencia).
 *  5. Siguiente paso concreto y fácil: escribir un correo.
 */
export const SUPPORT = Object.freeze({
  title: 'Esta suite también es tuya',

  paragraphs: [
    'Cada herramienta de ResQ Suite nació de horas reales de trabajo: ideas, ' +
      'pruebas, correcciones y noches frente a la pantalla. Son proyectos sin ' +
      'fines de lucro, pensados para que tus días sean un poco más fáciles.',

    'Si te han ahorrado tiempo, piensa en lo que ocurre cuando muchas personas ' +
      'ponen su granito de arena: el proyecto sigue vivo, los repositorios se ' +
      'mantienen al día y aparecen herramientas nuevas. Un aporte pequeño casi ' +
      'no se nota en tu bolsillo; en el proyecto, se nota mucho.',

    'No es una condición ni una obligación: todo seguirá a tu alcance. Es una ' +
      'invitación para quien quiera ser parte de lo que viene.',

    'Escríbeme y con gusto te comparto el número donde puedes colaborar. Y si ' +
      'necesitas una herramienta a tu medida, cuéntamela: lo conversamos y, si ' +
      'está a mi alcance, la desarrollo.',
  ],

  // Mención discreta de que el desarrollo es asistido por IA (vibe coding).
  footnote:
    'P. D. Trabajo con IA como copiloto (vibe coding): menos tiempo escribiendo ' +
    'código, más tiempo creando herramientas útiles para ti.',

  mailSubject: `${APP_NAME} · Quiero apoyar el proyecto`,
});

/**
 * Cuerpo del correo prellenado.
 * @param {string} [toolName] Herramienta desde la que se abrió el diálogo.
 * @returns {string}
 */
export function buildMailBody(toolName) {
  const lines = [
    'Hola Bryan,',
    '',
    `Uso ${APP_NAME} y me gustaría apoyar el proyecto. ¿Me compartes el número para colaborar?`,
  ];
  if (toolName) lines.push('', `Te escribo desde la tarjeta de: ${toolName}`);
  lines.push('', '(Opcional) Tengo una idea de herramienta que me gustaría plantearte:', '', '', 'Gracias por tu trabajo.');
  return lines.join('\n');
}
