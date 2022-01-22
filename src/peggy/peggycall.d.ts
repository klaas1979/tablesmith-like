declare function parse(
  expression: string,
  options: { table: string; group: string; modType: string; modNumber: number; params: string[] },
): void;
declare interface SyntaxError {
  location: {
    start: { offset: number; line: number; column: number };
    end: { offset: number; line: number; column: number };
  };
}
export { parse, SyntaxError };
