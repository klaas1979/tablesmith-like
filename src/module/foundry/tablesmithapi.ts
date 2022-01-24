import JournalTables from './journaltables';
import { tablesmith } from '../tablesmith/tablesmithinstance';
import { Logger } from './logger';
import { TableCallValues } from './tablecallvalues';
import TableSelectionForm from './tableselectionform';
export default class TablesmithApi {
  chatResults: boolean;
  constructor() {
    JournalTables.loadTablesFromJournal();
    this.chatResults = true;
  }

  /**
   * Reloads all tables and deletes table that has been removed.
   */
  reloadTables(): void {
    JournalTables.reloadTablesFromJournal();
  }

  /**
   * Shows the selector form to select and execute Tables.
   * @param callValues to prefill for with or undefined to start with emtpy form.
   * @returns TableSelectionForm that has already been rendered.
   */
  showForm(callValues: TableCallValues = new TableCallValues()): TableSelectionForm {
    const form = new TableSelectionForm(callValues);
    form.render(true);
    return form;
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
   * Parses Table call values from string and returns parse object.
   * @param expression to parse.
   * @returns TableCallValues for expression.
   */
  parseEvaluateExpression(expression: string): TableCallValues | undefined {
    let result = undefined;
    try {
      result = tablesmith.parseEvaluateExpression(expression);
    } catch (error) {
      Logger.info(false, `Could not parse Expression '${expression}'`);
    }
    return result;
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
}
