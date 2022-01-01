import * as peggy from 'peggy';
import fs from 'fs';
import TSTable from './tstable';
import TSParserFactory from './parser/tsparserfactory';
import RollResult from './expressions/rollresult';
import { roller } from './expressions/rollerinstance';
import path from 'path';

const parserFilePath = 'src/module/parser/tablesmith.pegjs';
const callParserFilePath = 'src/module/parser/tablesmithcall.pegjs';

/**
 * The Tablesmith class to setup the Tablesmith environment, contains all parsed tables and provides needed functionality
 * to retrive results.
 */
class Tablesmith {
  tstables: TSTable[];
  evaluateTable: TSTable | undefined;
  parser: peggy.Parser;
  parserGrammar: string;
  debugText: string;
  callParser: peggy.Parser;
  constructor() {
    this.tstables = [];
    this.parserGrammar = _parserGrammarSource();
    this.parser = _parser(this.parserGrammar);
    this.callParser = _callParser();
    this.debugText = '';
  }

  /**
   * Resets to instance without parsed tables, normally only needed for testing purpose.
   */
  reset(): void {
    this.tstables = [];
  }

  /**
   * Returns expressions factories debug text.
   * @returns The DebugText from the underlying TSExpressionFactory.
   */
  getDebugText(): string {
    return this.debugText;
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
    const evaluateTable = this.tableForName(options.table);
    if (!evaluateTable) throw `TSTable for name='${options.table}' not defined! Expression was '${expression}'`;
    roller.pushCurrentCallTablename(options.table);
    _setDefaultGroup(options);
    const group = evaluateTable.groupForName(options.group);
    if (!group)
      throw `TSTable for name='${options.table}' does not contain Group='${options.group}'! Expression was '${expression}'`;
    const rollResult = _createRollResult(group.getMaxValue(), options.fixedResult, options.modifier);

    const result = group.result(rollResult);
    roller.popCurrentCallTablename();
    return result;
  }

  /**
   * Parses table and stores it with given filename as Tablename.
   * @param filename name of file, used as Table name for evaluation.
   * @param fileContent file as a single string to be parsed.
   */
  addTable(filename: string, fileContent: string): void {
    const tstable = new TSTable(_stripPathAndExtensions(filename));
    try {
      const options = this._parseOptions(tstable);
      this.parser.parse(fileContent, options);
    } catch (error) {
      const syntaxError = error as peggy.parser.SyntaxError;
      if (typeof syntaxError.format === 'function') {
        const description = syntaxError.format([{ source: this.parserGrammar, text: fileContent }]);
        throw description;
      }
      throw error;
    }
    this.tstables.push(tstable);
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
    return this.tstables.find((current) => current.getName() === name);
  }

  getTSTables(): TSTable[] {
    return this.tstables;
  }

  getLastTSTable(): TSTable {
    return this.tstables[this.tstables.length - 1];
  }
}

/**
 * Strips file path and ".tab" extension to make table callable under it's name.
 * @param filename to strip from.
 * @returns string base file name without ".tab" extension.
 */
function _stripPathAndExtensions(filename: string): string {
  return path.basename(filename, '.tab');
}

function _parserGrammarSource(): string {
  return fs.readFileSync(parserFilePath, 'utf8');
}

function _parser(grammar: string): peggy.Parser {
  return peggy.generate(grammar);
}

function _callParser(): peggy.Parser {
  const peggyGrammar = fs.readFileSync(callParserFilePath, 'utf8');
  return peggy.generate(peggyGrammar);
}

/**
 * Tests if Group to call in options is set or sets it to default Group for any Table "Start".
 * @param options definining a Table call, with Group to set to default if undefined.
 */
function _setDefaultGroup(options: { group: string }): void {
  if (!options.group || options.group.length == 0) options.group = 'Start';
}

/**
 * Creates RollResult to be used for table evaluation.
 * @param maxValue if roll is needed this is the max value for the die.
 * @param fixedResult is result fixed? If true uses modifier to set the fixed result.
 * @param modifier modifier for roll or the fixed result if it is preset.
 * @returns RollResult for given values.
 */
function _createRollResult(maxValue: number, fixedResult: boolean, modifier: number): RollResult {
  let result;
  if (!fixedResult) {
    result = roller.roll(maxValue, modifier);
  } else {
    result = new RollResult(maxValue, modifier);
  }
  return result;
}

export default Tablesmith;
