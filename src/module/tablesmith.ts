import * as peggy from 'peggy';
import fs from 'fs';
import TSTable from './tstable';
import TSExpressionFactory from './expressions/tsexpressionsfactory';
import RollResult from './expressions/rollresult';
import { roller } from './expressions/rollerinstance';

const parserFilePath = 'src/module/tablesmith.pegjs';
const callParserFilePath = 'src/module/tablesmithcall.pegjs';

/**
 * The Tablesmith class to setup the Tablesmith environment, contains all parsed tables and provides needed functionality
 * to retrive results.
 */
class Tablesmith {
  tstables: TSTable[];
  evaluateTable: TSTable | undefined;
  parser: peggy.Parser;
  callParser: peggy.Parser;
  constructor() {
    this.tstables = [];
    this.parser = _parser();
    this.callParser = _callParser();
  }

  /**
   * Resets to instance without parsed tables, normally only needed for testing purpose.
   */
  reset(): void {
    this.tstables = [];
  }

  /**
   * Roll on a Table and Group and returns evaluated string. Roll can be preset with optional modifier '=' or
   * roll can be modified by a value using '+' or '-' to add modifier to the roll.
   * @param expression Expression to get evaluated Text Result for, form is [Table.Group] or [Group] with potential
   * added modifier in the form "=int", "+int" or "-int".
   * @returns result from Table as text.
   */
  evaluate(expression: string): string {
    const options = { table: '', group: '', fixedResult: false, modifier: 0 };
    this.callParser.parse(expression, options);
    this.evaluateTable = this.tableForName(options.table);
    if (!this.evaluateTable) throw `TSTable for name='${options.table}' not defined! Expression was '${expression}'`;

    const group = this.evaluateTable.groupForName(options.group);
    if (!group)
      throw `TSTable for name='${options.table}' does not contain Group='${options.group}'! Expression was '${expression}'`;
    const rollResult = createRollResult(group.getMaxValue(), options.fixedResult, options.modifier);

    const result = group.result(rollResult);
    this.evaluateTable = undefined;
    return result;
  }

  /**
   * Returns the table the call to evaluate was initiated on. Needed to resolve quick references to groups without table.
   * @returns The Table the call to evaluate started, or throws if not in an evaluate call.
   */
  getEvaluateTable(): TSTable {
    if (!this.evaluateTable) throw 'No evaluation started, no table set!';
    return this.evaluateTable;
  }

  /**
   * Parses table and stores it with given filename as Tablename.
   * @param filename name of file, used as Table name for evaluation.
   * @param fileContent file as a single string to be parsed.
   */
  addTable(filename: string, fileContent: string): void {
    const tstable = new TSTable(filename);
    try {
      this.parser.parse(fileContent, _options(tstable));
    } catch (error) {
      const syntaxError = error as peggy.parser.SyntaxError;
      console.log(syntaxError.location);
      throw `Could not add Table it has a Syntax Error at location=#${syntaxError.location}`;
    }
    this.tstables.push(tstable);
  }

  /**
   * Searches all tables for table with given name and returns it.
   * @param name of table to retrieve.
   * @returns Table for name or undefined if no table was found.
   */
  tableForName(name: string): TSTable | undefined {
    return this.tstables.find((current) => current.getName() === name);
  }

  getTSTables(): TSTable[] {
    return this.tstables;
  }

  getLastTSTable(): TSTable {
    return this.tstables[this.tstables.length - 1];
  }
}

function _parser(): peggy.Parser {
  const peggyGrammar = fs.readFileSync(parserFilePath, 'utf8');
  return peggy.generate(peggyGrammar);
}

function _callParser(): peggy.Parser {
  const peggyGrammar = fs.readFileSync(callParserFilePath, 'utf8');
  return peggy.generate(peggyGrammar);
}

function _options(table: TSTable): { table: TSTable; expressionFactory: TSExpressionFactory } {
  return { table: table, expressionFactory: new TSExpressionFactory() };
}

/**
 * Creates RollResult to be used for table evaluation.
 * @param maxValue if roll is needed this is the max value for the die.
 * @param fixedResult is result fixed? If true uses modifier to set the fixed result.
 * @param modifier modifier for roll or the fixed result if it is preset.
 * @returns RollResult for given values.
 */
function createRollResult(maxValue: number, fixedResult: boolean, modifier: number): RollResult {
  let result;
  if (!fixedResult) {
    result = roller.roll(maxValue, modifier);
  } else {
    result = new RollResult(maxValue, modifier);
  }
  return result;
}

export default Tablesmith;
