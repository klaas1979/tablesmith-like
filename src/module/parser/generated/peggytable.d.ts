import type TSParserFactory from '../tsparserfactory';

declare function parse(
  table: string,
  options: {
    pf: TSParserFactory; // pf= ParserFactory
  },
): void;
declare interface SyntaxError {
  format(a: string, b: string): void;
}

export { parse, SyntaxError };
