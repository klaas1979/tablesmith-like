import TSGroup from '../tsgroup';
import { roller } from './rollerinstance';
import TSExpression from './tsexpression';
import TSExpressions from './tsexpressions';

/**
 * Class representing a Group Expression referencing a variable value, or a variable reference within a Math calculation.
 * Can function as TSExpression or Term.
 */
class TSVariableSetExpression implements TSExpression {
  tablename: string | undefined;
  variablename: string;
  type: string;
  valueExpressions: TSExpressions | undefined;
  constructor(tablename: string | undefined, variablename: string, type: string) {
    this.tablename = tablename;
    this.variablename = variablename;
    this.type = type;
  }

  /**
   * Sets the ValueExpressions the set value is evaluated from.
   * @param valueExpressions to set as expression to calculate the set value from.
   */
  setValueExpressions(valueExpressions: TSExpressions) {
    this.valueExpressions = valueExpressions;
  }

  evaluate(): string {
    if (!this.valueExpressions)
      throw `No TSExpressions set for Variable set expression table '${this.tablename}', variable '${this.variablename}'`;
    const value = this.valueExpressions.evaluate();
    const currentValue = roller.getVar(this.tablename, this.variablename);
    switch (this.type) {
      case '=':
        this.evaluateSet(currentValue, value);
        break;
      case '+':
        this.evaluatePlus(currentValue, value);
        break;
      case '-':
        this.evaluateMinus(currentValue, value);
        break;
      case '*':
        this.evaluateMult(currentValue, value);
        break;
      case '/':
        this.evaluateDiv(currentValue, value);
        break;
      case '\\':
        this.evaluateDivRound(currentValue, value);
        break;
      case '&':
        this.evaluateAppendText(currentValue, value);
        break;
      case '<':
        this.evaluateMinimumBoundary(currentValue, value);
        break;
      case '>':
        this.evaluateMaximumBoundary(currentValue, value);
        break;
      default:
        throw `Unknown Type '${this.type}' cannot set variable '${this.getExpression()}'`;
    }
    return '';
  }

  private evaluateSet(currentValue: string | number | undefined, value: string) {
    this.assign(Number.parseInt(value));
  }

  private evaluatePlus(currentValue: string | number | undefined, value: string) {
    this.assign(Number.parseInt(`${currentValue}`) + Number.parseInt(value));
  }

  private evaluateMinus(currentValue: string | number | undefined, value: string) {
    this.assign(Number.parseInt(`${currentValue}`) - Number.parseInt(value));
  }

  private evaluateMult(currentValue: string | number | undefined, value: string) {
    this.assign(Number.parseInt(`${currentValue}`) * Number.parseInt(value));
  }

  private evaluateDiv(currentValue: string | number | undefined, value: string) {
    this.assign(Number.parseInt(`${currentValue}`) / Number.parseInt(value));
  }

  private evaluateDivRound(currentValue: string | number | undefined, value: string) {
    this.assign(Math.round(Number.parseInt(`${currentValue}`) / Number.parseInt(value)));
  }

  private evaluateMinimumBoundary(currentValue: string | number | undefined, value: string) {
    const currentInt = Number.parseInt(`${currentValue}`);
    const newInt = Number.parseInt(value);
    if (Number.isNaN(currentInt) || currentInt < newInt) this.assign(newInt);
  }

  private evaluateMaximumBoundary(currentValue: string | number | undefined, value: string) {
    const currentInt = Number.parseInt(`${currentValue}`);
    const newInt = Number.parseInt(value);
    if (Number.isNaN(currentInt) || currentInt > newInt) this.assign(newInt);
  }

  private evaluateAppendText(currentValue: string | number | undefined, value: string) {
    const result = currentValue ? `${currentValue}${value}` : `${value}`;
    this.assign(result);
  }

  private assign(value: string | number) {
    roller.assignVar(this.tablename, this.variablename, value);
  }

  getExpression(): string {
    return `|${this.variablename}${this.type}${this.valueExpressions?.getExpression()}|`;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setGroup(group: TSGroup): void {
    // empty
  }
}

export default TSVariableSetExpression;
