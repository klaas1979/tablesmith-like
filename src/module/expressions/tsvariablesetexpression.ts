import TSGroup from '../tsgroup';
import { evalcontext } from './evaluationcontextinstance';
import groupcallsplitter from './groupcallsplitter';
import TSExpression from './tsexpression';

/**
 * Class representing a variable Set expression.
 */
class TSVariableSetExpression implements TSExpression {
  varNameExpression: TSExpression;
  call: { tablename: string; variablename: string };
  type: string;
  valueExpression: TSExpression;
  constructor(varNameExpression: TSExpression, type: string, valueExpression: TSExpression) {
    this.varNameExpression = varNameExpression;
    this.type = type;
    this.valueExpression = valueExpression;
    this.call = { tablename: '', variablename: '' };
  }

  evaluate(): string {
    const evaluated = this.varNameExpression.evaluate();
    this.call = groupcallsplitter.split(evaluated);
    const value = this.valueExpression.evaluate();
    const currentValue = evalcontext.getVar(this.call.tablename, this.call.variablename);
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
    this.assign(Number.parseFloat(value));
  }

  private evaluatePlus(currentValue: string | number | undefined, value: string) {
    this.assign(Number.parseFloat(`${currentValue}`) + Number.parseFloat(value));
  }

  private evaluateMinus(currentValue: string | number | undefined, value: string) {
    this.assign(Number.parseFloat(`${currentValue}`) - Number.parseFloat(value));
  }

  private evaluateMult(currentValue: string | number | undefined, value: string) {
    this.assign(Number.parseFloat(`${currentValue}`) * Number.parseFloat(value));
  }

  private evaluateDiv(currentValue: string | number | undefined, value: string) {
    this.assign(Number.parseFloat(`${currentValue}`) / Number.parseFloat(value));
  }

  private evaluateDivRound(currentValue: string | number | undefined, value: string) {
    this.assign(Math.round(Number.parseFloat(`${currentValue}`) / Number.parseFloat(value)));
  }

  private evaluateMinimumBoundary(currentValue: string | number | undefined, value: string) {
    const currentInt = Number.parseFloat(`${currentValue}`);
    const newInt = Number.parseFloat(value);
    if (Number.isNaN(currentInt) || currentInt < newInt) this.assign(newInt);
  }

  private evaluateMaximumBoundary(currentValue: string | number | undefined, value: string) {
    const currentInt = Number.parseFloat(`${currentValue}`);
    const newInt = Number.parseFloat(value);
    if (Number.isNaN(currentInt) || currentInt > newInt) this.assign(newInt);
  }

  private evaluateAppendText(currentValue: string | number | undefined, value: string) {
    const result = currentValue ? `${currentValue}${value}` : `${value}`;
    this.assign(result);
  }

  private assign(value: string | number) {
    evalcontext.assignVar(this.call.tablename, this.call.variablename, value);
  }

  getExpression(): string {
    return `|${this.varNameExpression.getExpression()}${this.type}${this.valueExpression.getExpression()}|`;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setGroup(group: TSGroup): void {
    // empty
  }
}

export default TSVariableSetExpression;
