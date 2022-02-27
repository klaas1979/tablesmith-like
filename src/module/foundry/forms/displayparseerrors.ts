import { getGame } from '../helper';
import JournalTables from '../journaltables';

/**
 * Dialog that displays all encountered parse errors.
 */
export async function displayTableParseErrors() {
  const errors = JournalTables.getParseErrors();
  let html = '';
  if (errors.length == 0) html = getGame().i18n.localize('TABLESMITH.reload.no-parse-errors');
  for (const error of errors) {
    const errorHtml = error.error.replace(/\n/g, '<br/>');
    html += `<h2>'${error.foldername}' / '${error.tablename}'</h2>`;
    html += `<p>${errorHtml}</p>`;
  }
  Dialog.prompt({
    title: getGame().i18n.localize('TABLESMITH.reload.parse-errors'),
    content: html,
    callback: () => {
      // nothing to do on close, just a notification
    },
  });
}
