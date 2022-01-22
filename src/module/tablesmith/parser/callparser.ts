import { parse } from '../../../../build/parser/peggycall';

class Callparser {
  parse(
    call: string,
    options: { table: string; group: string; modType: string; modNumber: number; params: string[] },
  ): void {
    parse(call, options);
  }
}

export const callparser = new Callparser();
