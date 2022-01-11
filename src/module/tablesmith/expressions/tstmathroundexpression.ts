import TSGroup from '../tsgroup';
import TSExpression from './tsexpression';

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
  evaluate(): string {
    const valueString = this.param.evaluate();
    const value = Number.parseFloat(valueString);
    if (Number.isNaN(value)) throw `Could not get Round for non number value '${valueString}'!`;
    const decimalPlacesString = this.decimalPlaces.evaluate();
    const decimalPlaces = Number.parseInt(decimalPlacesString);
    if (Number.isNaN(value)) throw `Could not get Round for non number decimalPlaces '${valueString}'!`;
    return `${value.toFixed(decimalPlaces)}`;
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
