/**
 * Result from any evaluated Term. A term is a math or Dice part of an evaluation.
 * The result contains the mathematical total and the string representation before
 * the calculation.
 */
class TermResult {
  total: number;
  result: string;
  constructor(total: number, result: string) {
    this.total = total;
    this.result = result;
  }
}

export default TermResult;
