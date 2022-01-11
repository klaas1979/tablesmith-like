declare function parse(
  expression: string,
  options: { table: string; group: string; modType: string; modNumber: number },
): void;
declare interface SyntaxError {
  format(a: string, b: string): void;
}
export { parse, SyntaxError };
