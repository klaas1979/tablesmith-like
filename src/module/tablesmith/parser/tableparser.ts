import { parse, SyntaxError } from '../../../../build/parser/peggytable';
import type TSParserFactory from './tsparserfactory';

class Tableparser {
  parse(
    table: string,
    options: {
      pf: TSParserFactory; // pf= ParserFactory
    },
  ): void {
    try {
      parse(table, options);
    } catch (error) {
      const se = error as SyntaxError;
      const loc = se.location;
      const before = table.substring(Math.max(0, loc.start.offset - 15), loc.start.offset);
      const start = loc.start.offset;
      let end = loc.end.offset;
      if (end - start > 200) {
        end = start + 200;
      }
      const content = table.substring(start, end);
      const after = table.substring(loc.end.offset, Math.max(table.length, loc.end.offset + 15));
      const errorLocation = `Lines from ${loc.start.line} to ${loc.end.line}', columns from ${loc.start.column} to ${loc.end.column}, FileOffset from ${loc.start.offset} to ${loc.end.offset} \nText:>>>>\n${before}||>|${content}|<||${after}\n<<<<`;
      throw `Error '${se}' at location '${errorLocation}'`;
    }
  }
}

export const tableparser = new Tableparser();
