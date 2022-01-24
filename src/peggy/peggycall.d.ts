import TableCallValues from '../module/foundry/tablecallvalues';

declare function parse(expression: string, options: TableCallValues): void;
declare interface SyntaxError {
  location: {
    start: { offset: number; line: number; column: number };
    end: { offset: number; line: number; column: number };
  };
}
export { parse, SyntaxError };
