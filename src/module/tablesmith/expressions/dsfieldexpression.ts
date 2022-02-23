import TSExpression from './tsexpression';

export default class DSFieldExpression {
  name: TSExpression;
  value: TSExpression;
  constructor(name: TSExpression, value: TSExpression) {
    this.name = name;
    this.value = value;
  }
  /**
   * String representation for getExpression calls.
   * @returns string representation of this field.
   */
  getExpression(): string {
    return `${this.name.getExpression()},${this.value.getExpression()}`;
  }
}
