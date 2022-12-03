import { TSTable } from './tstable';
import TSParserFactory from './parser/tsparserfactory';
import GroupCallModifierTerm from './expressions/terms/groupcallmodifierterm';
import { tstables } from './tstables';
import { tableparser } from './parser/tableparser';
import { callparser } from './parser/callparser';
import { html2text } from './parser/html2text';
import { TableCallValues } from '../foundry/tablecallvalues';
import CallResult from './callresult';
import EvaluationContext from './expressions/evaluationcontext';
import { InputListCallback, InputTextCallback, MsgCallback, StatusCallback } from './inputcallbacktypes';
import { DSStores } from './dsstore/dsstores';
import { Logger } from '../foundry/logger';

/**
 * The Tablesmith class to setup the Tablesmith environment, contains all parsed tables and provides needed functionality
 * to retrive results.
 */
class Tablesmith {
  evaluateTable: TSTable | undefined;
  inputListCallback: InputListCallback | undefined;
  inputTextCallback: InputTextCallback | undefined;
  msgCallback: MsgCallback | undefined;
  statusCallback: StatusCallback | undefined;
  dsStores: DSStores | undefined;

  /**
   * Resets to instance without parsed tables, normally only needed for testing purpose.
   */
  reset(): void {
    tstables.reset();
  }

  /**
   * Roll on a Table and Group and returns evaluated string. Roll can be preset with optional modifier '=' or
   * roll can be modified by a value using '+' or '-' to add modifier to the roll.
   * @param call TableCallValues or Expression to get evaluated Text Result for,
   * form is [Table.Group] or [Group] with potential added modifier in the form "=int", "+int" or "-int".
   * @returns TableResult or TableResult[] single Result or array of results.
   */
  async evaluate(
    call: TableCallValues | string,
    parameters: { name: string; value: string | undefined }[] = [],
  ): Promise<CallResult> {
    try {
      const tableCallValues = this.parseEvaluateCall(call);
      if (!tableCallValues.group)
        throw Error(
          `TSTable for name='${tableCallValues.tablename}' does not contain Group='${tableCallValues.groupname}'! call was '${call}'`,
        );
      const modifier = GroupCallModifierTerm.create(tableCallValues.modifier, tableCallValues.modifierValue);
      const result = new CallResult(tableCallValues);
      for (let count = 0; count < tableCallValues.rollCount; count++) {
        const evalcontext = this.createEvaluationContext();
        evalcontext.pushCurrentCallTablename(tableCallValues.tablename);
        if (tableCallValues.parameters)
          tableCallValues.table?.setParametersForEvaluationByIndex(evalcontext, tableCallValues.parameters);
        tableCallValues.table?.setParametersForEvaluationByName(evalcontext, parameters);
        result.push(evalcontext, await tableCallValues.group.roll(evalcontext, modifier));
      }
      return result;
    } catch (error) {
      const e = error as Error;
      const result = new CallResult(call);
      result.setErrorMessage(`Error: ${e.message}`);
      return result;
    }
  }

  /**
   * Parses an evaluate expressions for Tablesmith.
   * @param expression to parse.
   * @returns TableCallValues to evaluate.
   */
  parseEvaluateCall(call: TableCallValues | string): TableCallValues {
    const tableCallValues = this._createCallValues(call);
    tableCallValues.table = this.tableForName(tableCallValues.tablename);
    if (!tableCallValues.table)
      throw Error(`TSTable for name='${tableCallValues.tablename}' not defined! Expression was '${call}'`);
    tableCallValues.tablename = tableCallValues.table.name; // ensure correct case
    tableCallValues.group = tableCallValues.table.groupForName(tableCallValues.groupname);
    return tableCallValues;
  }

  private _createCallValues(call: TableCallValues | string): TableCallValues {
    if (typeof call == 'string') {
      const callValues = new TableCallValues();
      callparser.parse(call, callValues);
      return callValues;
    } else {
      return call;
    }
  }

  /**
   * Creates a new EvaluationContext for all tables.
   * @returns EvaluationContext prepared context.
   */
  createEvaluationContext(): EvaluationContext {
    const context = new EvaluationContext();
    tstables.prepareEvaluationContext(context);
    if (this.inputListCallback) context.registerInputListCallback(this.inputListCallback);
    if (this.inputTextCallback) context.registerInputTextCallback(this.inputTextCallback);
    if (this.msgCallback) context.registerMsgCallback(this.msgCallback);
    if (this.statusCallback) context.registerStatusCallback(this.statusCallback);
    if (this.dsStores) context.registerDSStores(this.dsStores);
    return context;
  }

  /**
   * Parses table and stores it with given filename as Tablename.
   * @param foldername name of folder table is contained in.
   * @param filename name of file, used as Table name for evaluation.
   * @param fileContent file as a single string to be parsed.
   * @param contentType one of 'plain' default for plain text or 'html' for html text.
   */
  addTable(
    foldername: string,
    filename: string,
    fileContent: string,
    contentType: 'plain' | 'html' = 'plain',
  ): TSTable {
    const tstable = new TSTable(foldername, _stripPathAndExtensions(filename));
    const content = _convertContentType(fileContent, contentType);
    tableparser.parse(content, this._parseOptions(tstable));
    tstables.addTable(tstable);
    Logger.debug(false, 'Added table successful', filename, foldername, fileContent, tstable);
    return tstable;
  }

  _parseOptions(table: TSTable): {
    pf: TSParserFactory; // pf= ParserFactory
  } {
    return {
      pf: new TSParserFactory(table),
    };
  }

  /**
   * Searches all tables for table with given name and returns it.
   * @param name of table to retrieve.
   * @returns Table for name or undefined if no table was found.
   */
  tableForName(name: string): TSTable | undefined {
    return tstables.tableForName(name);
  }

  /**
   * Registers the async callback function for InputText.
   * @param callback to register as external input function, if a TS InputList is encountered.
   */
  registerInputListCallback(callback: InputListCallback): void {
    this.inputListCallback = callback;
  }
  /**
   * Registers the async callback function for InputText.
   * @param callback to register as external input function, if a TS InputList is encountered.
   */
  registerInputTextCallback(callback: InputTextCallback): void {
    this.inputTextCallback = callback;
  }
  /**
   * Registers the async callback function for Msg.
   * @param callback to register as external msg function.
   */
  registerMsgCallback(callback: MsgCallback): void {
    this.msgCallback = callback;
  }
  /**
   * Registers the async status callback function for Status.
   * @param callback to register as external status function.
   */
  registerStatusCallback(callback: StatusCallback): void {
    this.statusCallback = callback;
  }
  /**
   * Registers DSStores backend for all Dataset operations.
   * @param dsStores to register as external backend.
   */
  registerDSStores(dsStores: DSStores): void {
    this.dsStores = dsStores;
  }
}

function _stripPathAndExtensions(filename: string): string {
  return filename.trim().replace('.tab', '');
}

/**
 * Converts content to plain text for Tablesmith parsing.
 * @param content to convert to plain text.
 * @param type of input content needed to select converter.
 */
function _convertContentType(content: string, type: 'plain' | 'html'): string {
  let converted = content;
  if (type == 'html') {
    let replaced = html2text.convert(content);
    // replace nbsp char 160 to normal space char -> for matching in grammar
    replaced = replaced.replace(String.fromCharCode(160), ' ');
    do {
      converted = replaced;
      replaced = converted.replace('\n\n', '\n');
    } while (converted != replaced);
  }
  return converted;
}

export default Tablesmith;
