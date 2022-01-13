import type TSParserFactory from '../module/tablesmith/parser/tsparserfactory';

declare function parse(
  table: string,
  options: {
    pf: TSParserFactory; // pf= ParserFactory
  },
): void;
declare interface SyntaxError {
  location: {
    start: { offset: number; line: number; column: number };
    end: { offset: number; line: number; column: number };
  };
}

export { parse, SyntaxError };
