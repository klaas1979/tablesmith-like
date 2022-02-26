import TSExpression from './tsexpression';

export default class DSFieldCompareExpression {
  name: TSExpression;
  operator: string;
  value: TSExpression;
  constructor(name: TSExpression, operator: string, value: TSExpression) {
    this.name = name;
    this.operator = operator;
    this.value = value;
  }
  /**
   * String representation for getExpression calls.
   * @returns string representation of this field comparison.
   */
  getExpression(): string {
    return `${this.name.getExpression().trim()}${this.operator}${this.value.getExpression().trim()}`;
  }
}
