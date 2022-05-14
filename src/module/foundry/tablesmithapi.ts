import JournalTables from './journaltables';
import { tablesmith } from '../tablesmith/tablesmithinstance';
import { Logger } from './logger';
import { TableCallValues } from './tablecallvalues';
import TableSelectionForm from './forms/tableselectionform';
import ResultsTo from './resultsto';
import { displayTableParseErrors } from './forms/displayparseerrors';
import ParamInputForm from './forms/paraminputform';
import CallResult from '../tablesmith/callresult';
import { getFolders, getFormLastTablename, getJournal, TABLE_TRANSFORM_BASE_FOLDER } from './helper';
import { tstables } from '../tablesmith/tstables';
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
  async reloadTables(options: { showErrors: boolean } = { showErrors: true }): Promise<void> {
    const errors = await JournalTables.reloadTablesFromJournal();
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
    if (callValues.tablename === '') {
      const table = tstables.tableForName(getFormLastTablename());
      if (table) callValues.setTable(table);
    }
    const form = new TableSelectionForm(callValues);
    form.render(true);
    return form;
  }

  /**
   * Shows the selector form to select and execute Tables.
   * @param callValues to prefill for with or undefined to start with emtpy form.
   * @returns TableSelectionForm that has already been rendered.
   */
  evaluateForm(callValues: TableCallValues = new TableCallValues()): TableSelectionForm {
    const form = this.showForm(callValues);
    form.evaluateTable();
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
      Logger.info(false, `Could not parse Expression '${call}'`, error);
    }
    return result;
  }

  /**
   * Evaluates / rolls on given Tablesmith Table and posts result to chat.
   * @param call of table to evaluate, may be a call expression or a already parsed
   * TableCallValues object.
   * @param options Options object for evaluation.
   * @param options.toChat defaults to true, boolean value if results should be added to chat.
   * @param options.toJournal defaults to false, boolean value if results should be added to journal.
   * @param options.toDialog defaults to false, boolean value if results should be displayed in result dialog.
   * If toDialog is true, will ignore toChat and toJournal option.
   * @param options.lenient defaults to false, should the evaluation try to create a valid expression
   * by fixing standard errors?.
   * @param options.journal? optional object donating the journal to add results to.
   * @param options.journal.folder folder of Journal file to add results to.
   * @param options.journal.name Journal Entry name to add results to.
   * @param options.journalOptions.includeTimestamp boolean true if timestamp should be added to result.
   * @param options.journalOptions.notify boolean indicating if an UI notification should be shown.
   */
  async evaluateTable(
    call: TableCallValues | string,
    options: {
      toChat?: boolean;
      toJournal?: boolean;
      toDialog?: boolean;
      lenient?: boolean;
      journal?: { folder: string; name: string };
      journalOptions?: { includeTimestamp?: boolean; notify?: boolean };
    } = {
      toChat: true,
      toJournal: false,
      toDialog: false,
      lenient: false,
      journal: undefined,
      journalOptions: { includeTimestamp: true, notify: true },
    },
  ): Promise<CallResult> {
    if (options.lenient && typeof call === 'string') call = this.enhanceCall(call);
    const callValues = this.parseEvaluateCall(call);
    let result: CallResult = new CallResult(callValues ? callValues : call);
    if (options.toDialog) {
      this.evaluateForm(callValues);
    } else if (callValues) {
      const submitted = await ParamInputForm.gather(callValues);
      if (!submitted)
        Logger.warn(false, 'Gathering Parameters Form for Table closed, using default parameters!', callValues);
      result = await tablesmith.evaluate(callValues);
      Logger.debug(false, 'Result for', callValues, result);
      if (!options.toDialog && options.toChat) {
        new ResultsTo().chat(callValues, result);
      }
      if (!options.toDialog && options.toJournal) {
        new ResultsTo().journal(callValues, result, options.journal, options.journalOptions);
      }
    }
    return result;
  }

  datastores(): Promise<Map<string, string>> {
    if (!tablesmith.dsStores) throw Error('Cannot get Datastores, not initialized!');
    return tablesmith.dsStores.db.datastores();
  }

  /**
   * Fixes common call syntax errors to potentially fix an invalid call.
   * @param call to enhance to valid syntax.
   * @returns Enhanced call object.
   */
  private enhanceCall(call: string): string {
    call = call.trim();
    if (call[0] != '[') call = `[${call}]`; // wrap in Tablesmith call brackets if needed
    return call;
  }

  /**
   * Converts given Rolltable to Tab Journal, that can be used as Tablesmith Table.
   * @param rolltable to convert to JournalEntry.
   * @param options used for transformation.
   * @param options.overwrite if entry for name exists, should it be overwritten or not, defaults to false
   * @param options.folder to add entry to, if non provided uses default one.
   */
  async rolltable2JournalTab(
    rolltable: RollTable,
    options: {
      overwrite: boolean;
      folder?: string;
    } = {
      overwrite: false,
    },
  ): Promise<void> {
    let content = '<p>:Start<br>';
    content += rolltable.data.results
      .map((e) => {
        return `${e.data.range[1]},${e.data.text}`;
      })
      .join('<br>');
    content += '</p>';

    const foldername = options.folder ? options.folder : TABLE_TRANSFORM_BASE_FOLDER;
    const journalname =
      `${rolltable.name}`
        .replace(/[.{(\[]-/g, ':')
        .replace(/[^a-z0-9 _:]/gi, ' ')
        .replace(/ +/g, ' ')
        .trim() + '.tab';
    let folder = getFolders().contents.find((f) => f.name === foldername);
    if (!folder) folder = await Folder.create({ name: foldername, type: 'JournalEntry' });
    const journalEntry = getJournal().contents.find((j) => {
      return j.name === journalname && j.folder?.name === foldername;
    });
    if (journalEntry && options.overwrite) {
      journalEntry.update({ content: content });
    } else JournalEntry.create({ name: journalname, folder: folder, content: content });
  }
}
