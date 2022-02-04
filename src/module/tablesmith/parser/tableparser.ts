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
      if (se.location) {
        const loc = se.location;
        const before = table.substring(Math.max(0, loc.start.offset - 100), loc.start.offset);
        const start = loc.start.offset;
        const end = loc.end.offset;
        let content = table.substring(start, end);
        if (end - start > 200) {
          content = table.substring(start, start + 100) + '||<||stripped||>||' + table.substring(end - 100, end);
        }
        const after = table.substring(loc.end.offset, Math.min(table.length, loc.end.offset + 100));
        const errorLocation = `Lines from ${loc.start.line} to ${loc.end.line}', columns from ${loc.start.column} to ${loc.end.column}, FileOffset from ${loc.start.offset} to ${loc.end.offset} \nText:>>>>\n${before}||>|${content}|<||${after}\n<<<<`;
        throw Error(
          `Error '${se}' at location '${errorLocation}', stack=${options.pf.getStackRepresentationForError()}`,
        );
      }
      throw error;
    }
  }
}

export const tableparser = new Tableparser();
