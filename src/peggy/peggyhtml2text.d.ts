declare function parse(html: string): Array<string>;
declare interface SyntaxError {
  location: {
    start: { offset: number; line: number; column: number };
    end: { offset: number; line: number; column: number };
  };
}
export { parse, SyntaxError };
