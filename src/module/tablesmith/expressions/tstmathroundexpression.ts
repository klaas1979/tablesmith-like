import TSGroup from '../tsgroup';
import TSExpression from './tsexpression';
import TSExpressionResult from './tsexpressionresult';

/**
 * Math Round function on contaned expression.
 */
class TSMathRoundExpression implements TSExpression {
  param: TSExpression;
  decimalPlaces: TSExpression;
  constructor(param: TSExpression, decimalPlaces: TSExpression) {
    this.param = param;
    this.decimalPlaces = decimalPlaces;
  }
  evaluate(): TSExpressionResult {
    const value = this.param.evaluate().asNumber();
    const decimalPlacesString = this.decimalPlaces.evaluate().asString();
    const decimalPlaces = Number.parseInt(decimalPlacesString);
    return new TSExpressionResult(value.toFixed(decimalPlaces));
  }
  getExpression(): string {
    return `{Round~${this.decimalPlaces.getExpression()},${this.param.getExpression()}}`;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setGroup(group: TSGroup): void {
    // empty
  }
}

export default TSMathRoundExpression;
