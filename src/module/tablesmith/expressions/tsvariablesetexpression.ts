import CallSplitter from './callsplitter';
import TSExpression, { BaseTSExpression } from './tsexpression';
import { TSExpressionResult, SingleTSExpressionResult } from './tsexpressionresult';
import EvaluationContext from './evaluationcontext';

/**
 * Class representing a variable Set expression.
 */
export default class TSVariableSetExpression extends BaseTSExpression {
  varNameExpression: TSExpression;
  call: { tablename: string; variablename: string };
  type: string;
  valueExpression: TSExpression;
  constructor(varNameExpression: TSExpression, type: string, valueExpression: TSExpression) {
    super();
    this.varNameExpression = varNameExpression;
    this.type = type;
    this.valueExpression = valueExpression;
    this.call = { tablename: '', variablename: '' };
  }

  async evaluate(evalcontext: EvaluationContext): Promise<TSExpressionResult> {
    const evaluated = await this.varNameExpression.evaluate(evalcontext);
    this.call = CallSplitter.forVariable().split(evalcontext, evaluated.asString());
    const value = await this.valueExpression.evaluate(evalcontext);
    const currentValue = evalcontext.getVar(this.call.tablename, this.call.variablename);
    switch (this.type) {
      case '=':
        this.evaluateSet(evalcontext, currentValue, value);
        break;
      case '+':
        this.evaluatePlus(evalcontext, currentValue, value);
        break;
      case '-':
        this.evaluateMinus(evalcontext, currentValue, value);
        break;
      case '*':
        this.evaluateMult(evalcontext, currentValue, value);
        break;
      case '/':
        this.evaluateDiv(evalcontext, currentValue, value);
        break;
      case '\\':
        this.evaluateDivRound(evalcontext, currentValue, value);
        break;
      case '&':
        this.evaluateAppendText(evalcontext, currentValue, value);
        break;
      case '<':
        this.evaluateMinimumBoundary(evalcontext, currentValue, value);
        break;
      case '>':
        this.evaluateMaximumBoundary(evalcontext, currentValue, value);
        break;
      default:
        throw Error(`Unknown Type '${this.type}' cannot set variable '${this.getExpression()}'`);
    }
    return new SingleTSExpressionResult('');
  }

  private evaluateSet(
    evalcontext: EvaluationContext,
    currentValue: string | number | undefined,
    value: TSExpressionResult,
  ) {
    const num = Number.parseFloat(value.asString());
    this.assign(evalcontext, Number.isNaN(num) ? value.asString() : num);
  }

  private evaluatePlus(
    evalcontext: EvaluationContext,
    currentValue: string | number | undefined,
    value: TSExpressionResult,
  ) {
    this.assign(evalcontext, Number.parseFloat(`${currentValue}`) + value.asNumber());
  }

  private evaluateMinus(
    evalcontext: EvaluationContext,
    currentValue: string | number | undefined,
    value: TSExpressionResult,
  ) {
    this.assign(evalcontext, Number.parseFloat(`${currentValue}`) - value.asNumber());
  }

  private evaluateMult(
    evalcontext: EvaluationContext,
    currentValue: string | number | undefined,
    value: TSExpressionResult,
  ) {
    this.assign(evalcontext, Number.parseFloat(`${currentValue}`) * value.asNumber());
  }

  private evaluateDiv(
    evalcontext: EvaluationContext,
    currentValue: string | number | undefined,
    value: TSExpressionResult,
  ) {
    this.assign(evalcontext, Number.parseFloat(`${currentValue}`) / value.asNumber());
  }

  private evaluateDivRound(
    evalcontext: EvaluationContext,
    currentValue: string | number | undefined,
    value: TSExpressionResult,
  ) {
    this.assign(evalcontext, Math.round(Number.parseFloat(`${currentValue}`) / value.asNumber()));
  }

  private evaluateMinimumBoundary(
    evalcontext: EvaluationContext,
    currentValue: string | number | undefined,
    value: TSExpressionResult,
  ) {
    const currentInt = Number.parseFloat(`${currentValue}`);
    const newInt = Number.parseFloat(value.asString());
    if (Number.isNaN(currentInt) || currentInt < newInt) this.assign(evalcontext, newInt);
  }

  private evaluateMaximumBoundary(
    evalcontext: EvaluationContext,
    currentValue: string | number | undefined,
    value: TSExpressionResult,
  ) {
    const currentInt = Number.parseFloat(`${currentValue}`);
    const newInt = value.asNumber();
    if (Number.isNaN(currentInt) || currentInt > newInt) this.assign(evalcontext, newInt);
  }

  private evaluateAppendText(
    evalcontext: EvaluationContext,
    currentValue: string | number | undefined,
    value: TSExpressionResult,
  ) {
    const valueString = value.asString();
    const result = currentValue ? `${currentValue}${valueString}` : `${valueString}`;
    this.assign(evalcontext, result);
  }

  private assign(evalcontext: EvaluationContext, value: string | number) {
    evalcontext.assignVar(this.call.tablename, this.call.variablename, value);
  }

  getExpression(): string {
    return `|${this.varNameExpression.getExpression()}${this.type}${this.valueExpression.getExpression()}|`;
  }
}
