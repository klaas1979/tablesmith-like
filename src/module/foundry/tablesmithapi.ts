import JournalTables from './journaltables';
import { tablesmith } from '../tablesmith/tablesmithinstance';
import { Logger } from './logger';
import { TableCallValues } from './tablecallvalues';
import TableSelectionForm from './tableselectionform';
import ChatResults from './chatresults';
import { displayTableParseErrors } from './displayparseerrors';
export default class TablesmithApi {
  constructor() {
    JournalTables.loadTablesFromJournal();
  }

  /**
   * Reloads all tables and deletes table that has been removed, if errors are encountered and options
   * set the Errors are displayed in a Dialog for inspection.
   * @param options for reloading tables.
   * @param options.showErrors boolean indicating of errors on reload should be displayed va dialog, defaults
   * to true.
   */
  reloadTables(options: { showErrors: boolean } = { showErrors: true }): void {
    const errors = JournalTables.reloadTablesFromJournal();
    if (options.showErrors && errors.length > 0) this.displayTableParseErrors();
  }

  /**
   * Shows a Dialog with all encountered Table parse errors.
   */
  displayTableParseErrors(): void {
    displayTableParseErrors();
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
   * Parses Table call values from string and returns parse object.
   * @param expression to parse.
   * @returns TableCallValues for expression.
   */
  parseEvaluateCall(call: TableCallValues | string): TableCallValues | undefined {
    let result = undefined;
    try {
      result = tablesmith.parseEvaluateCall(call);
    } catch (error) {
      Logger.info(false, `Could not parse Expression '${call}'`);
    }
    return result;
  }

  /**
   * Evaluates / rolls on given Tablesmith Table and posts result to chat.
   * @param call of table to evaluate, may be a call expression or a already parsed
   * TableCallValues object.
   * @param chatResults defaults to true, boolean value if results should be added to chat.
   */
  async evaluateTable(call: TableCallValues | string, chatResults = true): Promise<string | string[]> {
    let result: string | string[] = '';
    const callValues = this.parseEvaluateCall(call);
    if (callValues) {
      result = await tablesmith.evaluate(call);
      Logger.debug(false, 'Result for', callValues, result);
      if (chatResults) {
        new ChatResults().chatResults(callValues, result);
      }
    }
    return result;
  }
}
