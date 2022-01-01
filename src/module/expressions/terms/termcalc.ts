/**
 * Supporting interface for basic Term implementation.
 */
interface TermCalc {
  calc(a: number, b: number): number;
  operator(): string;
}

export default TermCalc;
