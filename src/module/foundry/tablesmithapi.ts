import JournalTables from './journaltables';
import { tablesmith } from '../tablesmith/tablesmithinstance';
import { Logger } from './logger';
import TableCallValues from './tablecallvalues';
import { tableSelectionForm } from './tableselectionform';

export default class TablesmithApi {
  chatResults: boolean;
  constructor() {
    JournalTables.loadTablesFromJournal(tablesmith);
    this.chatResults = true;
  }

  /**
   * Shows the selector form to select and execute Tables.
   */
  showForm(): void {
    tableSelectionForm.render(true);
  }

  /**
   * Disables posting results to chat.
   */
  disableChat(): void {
    this.chatResults = false;
  }

  /**
   * Enables posting results to chat.
   */
  enableChat(): void {
    this.chatResults = true;
  }

  /**
   * Evaluates / rolls on given Tablesmith Table and posts result to chat.
   * @param name of table to evaluate.
   */
  evaluateTable(call: TableCallValues | string): string {
    const expression = typeof call != 'string' ? call.createExpression() : call;
    const result = tablesmith.evaluate(`${expression}`);
    Logger.debug(false, `Result for: ${expression}`, result);
    if (this.chatResults) {
      const chatMessage = new ChatMessage({ flavor: `Table: ${expression}`, content: result });
      ui.chat?.postOne(chatMessage);
    }
    return result;
  }

  /**
   * Evaluates / rolls on given Tablesmith Table and posts result to chat.
   * @param name of table to evaluate.
   */
  replaceTablesmithCalls(input: string): string {
    const chatState = this.chatResults;
    this.disableChat();
    let result = input;
    try {
      result = this.evaluateTable(`${input}`);
    } catch (error) {
      Logger.info(false, `Could not evaluate '${input}', error: `, error);
    }
    this.chatResults = chatState;
    return result;
  }
}
