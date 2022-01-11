import { parse } from '../../../../build/parser/peggytable';
import type TSParserFactory from './tsparserfactory';

class Tableparser {
  parse(
    table: string,
    options: {
      pf: TSParserFactory; // pf= ParserFactory
    },
  ): void {
    parse(table, options);
  }
}

export const tableparser = new Tableparser();
