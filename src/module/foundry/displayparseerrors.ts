import { getGame } from './helper';
import JournalTables from './journaltables';

/**
 * Dialog that displays all encountered parse errors.
 */
export async function displayTableParseErrors() {
  const errors = JournalTables.getParseErrors();
  let html = '';
  if (errors.length == 0) html = getGame().i18n.localize('TABLESMITH.no-parse-errors');
  for (const error of errors) {
    html += `<h2>'${error.foldername}' / '${error.tablename}'</h2>`;
    html += `<p>${error.error}</p>`;
  }
  Dialog.prompt({
    title: getGame().i18n.localize('TABLESMITH.parse-errors'),
    content: html,
    callback: () => {
      // nothing to do on close, just a notification
    },
  });
}
