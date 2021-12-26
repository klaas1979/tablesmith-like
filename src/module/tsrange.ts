import TSExpression from './expressions/tsexpression';

class TSRange {
  lower: number;
  upper: number;
  expressions: TSExpression[];
  constructor(lower: number, upper: number) {
    this.lower = lower;
    this.upper = upper;
    this.expressions = [];
  }

  covers(value: number): boolean {
    return value >= this.lower && value <= this.upper;
  }

  getLower(): number {
    return this.lower;
  }

  getUpper(): number {
    return this.upper;
  }

  getText(): string {
    let result = '';
    this.expressions.forEach((expression) => {
      result += expression.evaluate();
    });
    return result;
  }

  getExpression(): string {
    let result = '';
    this.expressions.forEach((expression) => {
      result += expression.getExpression();
    });
    return result;
  }

  add(expression: TSExpression) {
    this.expressions.push(expression);
  }
}

export default TSRange;
