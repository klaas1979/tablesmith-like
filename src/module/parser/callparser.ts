import { parse } from './generated/peggycall';

class Callparser {
  parse(call: string, options: { table: string; group: string; modType: string; modNumber: number }): void {
    parse(call, options);
  }
}

export const callparser = new Callparser();
