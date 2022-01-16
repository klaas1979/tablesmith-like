import JournalTables from './journaltables';
import { tablesmith } from '../tablesmith/tablesmithinstance';
import { Logger } from './logger';
import TableCallValues from './tablecallvalues';
import { tableSelectionForm } from './tableselectionform';

export default class TablesmithApi {
  constructor() {
    JournalTables.loadTablesFromJournal(tablesmith);
  }

  showForm() {
    tableSelectionForm.render(true);
  }

  /**
   * Evaluates / rolls on given Tablesmith Table and posts result to chat.
   * @param name of table to evaluate.
   */
  async evaluateTable(callValues: TableCallValues) {
    const result = tablesmith.evaluate(`[${callValues.createExpression()}]`);
    Logger.debug(false, 'Result for Table: ${name}', result);
    const chatMessage = new ChatMessage({ flavor: `Table: ${name}`, content: result });
    ui.chat?.postOne(chatMessage);
  }
}
