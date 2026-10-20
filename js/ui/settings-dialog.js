/**
 * ui/settings-dialog.js
 * Diálogo de ajustes: usuario de GitHub, topic y token.
 */

import { $ } from './dom.js';

/**
 * @param {{onSave: (config: {user: string, topic: string, token: string}) => void}} handlers
 * @returns {{open: (config: object) => void}}
 */
export function createSettingsDialog({ onSave }) {
  const dialog = $('#settingsDialog');
  const form = $('#settingsForm');
  const fields = {
    user: $('#fieldUser'),
    topic: $('#fieldTopic'),
    token: $('#fieldToken'),
  };

  // Enter o el botón "Guardar" envían el formulario.
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    onSave({
      user: fields.user.value.trim(),
      topic: fields.topic.value.trim(),
      token: fields.token.value.trim(),
    });
    dialog.close();
  });

  $('#settingsCancel').addEventListener('click', () => dialog.close());

  /** Precarga los valores actuales y muestra el diálogo. */
  function open(config) {
    fields.user.value = config.user;
    fields.topic.value = config.topic;
    fields.token.value = config.token;
    dialog.showModal();
  }

  return { open };
}
