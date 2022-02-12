import EvaluationContext from './evaluationcontext';
import TSExpression from './tsexpression';

export enum TS_EXPRESSION_RESULT_TYPE {
  SINGLE,
  COLLECTION,
  REROLLABLE,
}

/**
 * Tablesmith expressions result is the result a single expression evaluates to. It provides
 * som convenience methods to interact with the result.
 */
export interface TSExpressionResult {
  /**
   * Returns if this Result is rerollable normally a group with a '~' at beginning.
   * @returns true if rerollable, false if static.
   */
  isRerollable(): boolean;

  /**
   * Rerolls this result, if it is rerollable.
   */
  reroll(): Promise<void>;

  /**
   * Condenses this result.
   * @returns condensed TSExpressionResult.
   */
  condense(): TSExpressionResult;

  /**
   * Returns if this Result is empty, meaning that it does not change the printed output
   * in any case.
   * @returns true if it is empty, false if not.
   */
  isEmpty(): boolean;

  /**
   * Returns the type of this TSExpressionResult.
   * @returns true if rerollable, false if static.
   */
  type(): TS_EXPRESSION_RESULT_TYPE;

  /**
   * Returns result as string.
   * @returns result as String.
   */
  asString(): string;

  /**
   * Returns result as trimmed string.
   * @returns result as trimmed string.
   */
  trim(): string;

  /**
   * Returns result as parsed number, throws if NaN.
   * @returns result as number.
   */
  asNumber(): number;

  /**
   * Returns result as parsed int, throws if NaN.
   * @returns result as parsed int.
   */
  asInt(): number;
}

/**
 * Simple Base implementation with some convenience methods implemented.
 */
class BaseTSExpressionResult implements TSExpressionResult {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async reroll(): Promise<void> {
    // empty
  }
  condense(): TSExpressionResult {
    return this;
  }
  isEmpty(): boolean {
    throw Error('Not implemented, needs to be defined in subclass!');
  }
  isRerollable(): boolean {
    return false;
  }
  type(): TS_EXPRESSION_RESULT_TYPE {
    throw Error('Not implemented, needs to be defined in subclass!');
  }
  asString(): string {
    throw Error('Not implemented, needs to be defined in subclass!');
  }
  trim(): string {
    return this.asString().trim();
  }
  asNumber(): number {
    const num = Number.parseFloat(this.asString());
    if (Number.isNaN(num)) throw Error(`Could not parse number as float '${this.asString()}'!`);
    return num;
  }
  asInt(): number {
    const num = Number.parseInt(this.asString());
    if (Number.isNaN(num)) throw Error(`Could not parse number as int '${this.asString()}'!`);
    return num;
  }
}

/**
 * Single results are the leaves of the tables, normally plain text.
 */
export class SingleTSExpressionResult extends BaseTSExpressionResult implements TSExpressionResult {
  private result: string;
  constructor(result: string | number) {
    super();
    this.result = `${result}`;
  }
  isEmpty(): boolean {
    return this.result.length === 0;
  }
  type(): TS_EXPRESSION_RESULT_TYPE {
    return TS_EXPRESSION_RESULT_TYPE.SINGLE;
  }
  asString(): string {
    return this.result;
  }
}

/**
 * A rerollable result is always a single result containing at least on other result, that is rerolled.
 * The other result maybe a TSExpressionResultCollection.
 */
export class RerollableTSExpressionResult extends BaseTSExpressionResult implements TSExpressionResult {
  private result: TSExpressionResult;
  private expression: TSExpression | undefined;
  private evalcontext: EvaluationContext;
  constructor(evalcontext: EvaluationContext, result: TSExpressionResult, expression: TSExpression | undefined) {
    super();
    this.evalcontext = evalcontext.clone();
    this.result = result;
    this.expression = expression;
  }
  isEmpty(): boolean {
    return !this.result.isRerollable() && this.result.asString().length === 0;
  }
  type(): TS_EXPRESSION_RESULT_TYPE {
    return TS_EXPRESSION_RESULT_TYPE.REROLLABLE;
  }
  asString(): string {
    return this.result.asString();
  }
  isRerollable(): boolean {
    return this.expression !== undefined;
  }
  async reroll() {
    if (this.expression) {
      this.result = await this.expression.evaluate(this.evalcontext);
    }
  }
}

/**
 * A collection of TSExpression Results.
 */
export class TSExpressionResultCollection extends BaseTSExpressionResult implements TSExpressionResult {
  results: TSExpressionResult[];
  constructor() {
    super();
    this.results = [];
  }
  condense(): TSExpressionResult {
    const result = new TSExpressionResultCollection();
    for (let r of this.results) {
      r = r.condense();
      if (!r.isEmpty()) {
        const isCollection = r.type() === TS_EXPRESSION_RESULT_TYPE.COLLECTION;
        if (!isCollection && !r.isRerollable() && !result._getLast()?.isRerollable()) {
          let prev = result.pop()?.asString();
          prev = prev == undefined ? '' : prev;
          result.addResult(new SingleTSExpressionResult(prev + r.asString()));
        } else result.addResult(r);
      }
    }
    if (result.size() === 1) return result.results[0];
    return result;
  }
  isEmpty(): boolean {
    return this.results.length === 0;
  }
  type(): TS_EXPRESSION_RESULT_TYPE {
    return TS_EXPRESSION_RESULT_TYPE.COLLECTION;
  }
  asString(): string {
    let result = '';
    for (const r of this.results) {
      result += r.asString();
    }
    return result;
  }

  /**
   * Creates a new condensed Result collection from given inputs.
   * @param results to create collection from.
   * @returns condensed result collection.
   */
  static create(...results: TSExpressionResult[]): TSExpressionResult {
    const result = new TSExpressionResultCollection();
    result.results = results;
    return result.condense();
  }
  /**
   * Iterates of all results with given callback function.
   * @param callbackFn for iteration.
   */
  forEach(callbackFn: (result: TSExpressionResult, index?: number) => void) {
    this.results.forEach(callbackFn);
  }

  /**
   * Returns size of collection.
   * @returns number size of this collection.
   */
  size(): number {
    return this.results.length;
  }

  /**
   * Returns last result in current collection.
   */
  _getLast(): TSExpressionResult | undefined {
    const len = this.results.length;
    if (len > 0) return this.results[len - 1];
    else return undefined;
  }

  /**
   * Returns last result in current collection removing it from the collection.
   */
  pop(): TSExpressionResult | undefined {
    return this.results.pop();
  }

  /**
   * Adds result to this collection.
   * @param result to add to this collection.
   */
  addResult(result: TSExpressionResult): void {
    this.results.push(result);
  }
}
