import { TSTable } from './tstable';
import TSParserFactory from './parser/tsparserfactory';
import { evalcontext } from './expressions/evaluationcontextinstance';
import GroupCallModifierTerm from './expressions/terms/groupcallmodifierterm';
import { tstables } from './tstables';
import { tableparser } from './parser/tableparser';
import { callparser } from './parser/callparser';
import { html2text } from './parser/html2text';
import { TableCallValues } from '../foundry/tablecallvalues';

/**
 * The Tablesmith class to setup the Tablesmith environment, contains all parsed tables and provides needed functionality
 * to retrive results.
 */
class Tablesmith {
  evaluateTable: TSTable | undefined;

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
   * @returns result from Table as text.
   */
  async evaluate(
    call: TableCallValues | string,
    parameters: { name: string; value: string | undefined }[] = [],
  ): Promise<string | string[]> {
    try {
      const tableCallValues = this.parseEvaluateCall(call);
      if (!tableCallValues.group)
        throw Error(
          `TSTable for name='${tableCallValues.tablename}' does not contain Group='${tableCallValues.groupname}'! call was '${call}'`,
        );
      const modifier = GroupCallModifierTerm.create(tableCallValues.modifier, tableCallValues.modifierValue);
      const result = [];
      for (let count = 0; count < tableCallValues.rollCount; count++) {
        this.resetEvaluationContext();
        evalcontext.pushCurrentCallTablename(tableCallValues.tablename);
        if (tableCallValues.parameters)
          tableCallValues.table?.setParametersForEvaluationByIndex(tableCallValues.parameters);
        tableCallValues.table?.setParametersForEvaluationByName(parameters);
        result.push(await tableCallValues.group.roll(modifier));
        evalcontext.popCurrentCallTablename();
      }
      return result.length == 1 ? result[0] : result;
    } catch (error) {
      const e = error as Error;
      return `Error: ${e.message}`;
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
   * Resets the EvaluationContext for all tables.
   */
  resetEvaluationContext() {
    tstables.resetEvaluationContext();
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
  registerInputTextCallback(callback: (prompt: string, defaultValue: string) => Promise<string>): void {
    evalcontext.registerInputTextCallback(callback);
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
