/**
 * ui/support-dialog.js
 * Diálogo "Apoya al desarrollador": muestra la nota, el correo de contacto y
 * permite escribirme (mailto prellenado) o copiar la dirección.
 */

import { $, h } from './dom.js';
import { CONTACT_EMAIL } from '../config.js';
import { SUPPORT, buildMailBody } from '../content.js';

/** Construye el enlace mailto con asunto y cuerpo ya redactados. */
function buildMailto(toolName) {
  const subject = encodeURIComponent(SUPPORT.mailSubject);
  const body = encodeURIComponent(buildMailBody(toolName));
  return `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
}

/** Copia texto al portapapeles (con alternativa para navegadores antiguos). */
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const helper = h('textarea', { readonly: true, style: 'position:fixed;opacity:0' });
    helper.value = text;
    document.body.append(helper);
    helper.select();
    const ok = document.execCommand('copy');
    helper.remove();
    return ok;
  }
}

/** @returns {{open: (toolName?: string) => void}} */
export function createSupportDialog() {
  const dialog = $('#supportDialog');
  const mailLink = $('#supportMail');
  const copyButton = $('#supportCopy');
  let resetLabelTimer;

  // El contenido es estático: se rellena una sola vez al crear el diálogo.
  $('#supportTitle').textContent = SUPPORT.title;
  $('#supportEmail').textContent = CONTACT_EMAIL;
  $('#supportBody').replaceChildren(
    ...SUPPORT.paragraphs.map((text) => h('p', {}, text)),
    h('p', { class: 'dialog__footnote' }, SUPPORT.footnote),
  );

  $('#supportClose').addEventListener('click', () => dialog.close());

  copyButton.addEventListener('click', async () => {
    const copied = await copyToClipboard(CONTACT_EMAIL);
    copyButton.textContent = copied ? '¡Copiado!' : 'No se pudo copiar';
    clearTimeout(resetLabelTimer);
    resetLabelTimer = setTimeout(() => (copyButton.textContent = 'Copiar correo'), 2000);
  });

  /** @param {string} [toolName] Se incluye en el correo para saber desde dónde escribe. */
  function open(toolName) {
    mailLink.href = buildMailto(toolName);
    dialog.showModal();
  }

  return { open };
}
