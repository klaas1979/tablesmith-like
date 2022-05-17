import EvaluationContext from './evaluationcontext';
import TSExpression from './tsexpression';
import TSInputTextExpression from './tsinputtextexpression';

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
   * Returns if this Result is a note expression to enter text.
   * @returns true if note, false if static.
   */
  isNote(): boolean;

  /**
   * Returns if this Result is a plain text.
   * @returns true if text, false if not.
   */
  isText(): boolean;

  /**
   * Returns if this Result is a collection of results.
   * @returns true if collection, false if not.
   */
  isCollection(): boolean;

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
  isNote(): boolean {
    return false;
  }
  isText(): boolean {
    return false;
  }
  isCollection(): boolean {
    return false;
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
  result: string;
  constructor(result: string | number) {
    super();
    this.result = `${result}`;
  }
  isText(): boolean {
    return true;
  }
  isEmpty(): boolean {
    return this.result.length === 0;
  }
  asString(): string {
    return this.result;
  }
}

/**
 * Single results are the leaves of the tables, normally plain text.
 */
export class NoteTSExpressionResult extends BaseTSExpressionResult implements TSExpressionResult {
  text: TSExpressionResult;
  inputTextExpression: TSInputTextExpression;
  uuid: string | undefined;
  evalcontext: EvaluationContext | undefined;
  constructor(
    evalcontext: EvaluationContext,
    text: SingleTSExpressionResult,
    inputTextExpression: TSInputTextExpression,
  ) {
    super();
    this.evalcontext = evalcontext;
    this.inputTextExpression = inputTextExpression;
    this.uuid = this.evalcontext.storeNote(this);
    this.text = text;
  }
  isNote(): boolean {
    return true;
  }
  isEmpty(): boolean {
    return this.text.asString().length === 0;
  }
  asString(): string {
    return this.text.asString();
  }
  async reroll(): Promise<void> {
    if (this.text) {
      if (!this.evalcontext) throw Error('evalcontext not set for note!');
      this.text = await this.inputTextExpression.evaluate(this.evalcontext);
    }
  }
}

/**
 * A rerollable result is always a single result containing at least on other result, that is rerolled.
 * If reroll is not set the object acts as a collection for compatibility reasons.
 * The other result may be a TSExpressionResultCollection.
 */
export class RerollableTSExpressionResult extends BaseTSExpressionResult implements TSExpressionResult {
  result: TSExpressionResult;
  results: TSExpressionResult[];
  expression: TSExpression | undefined;
  uuid: string | undefined;
  evalcontext: EvaluationContext | undefined;
  constructor(evalcontext: EvaluationContext, result: TSExpressionResult, expression: TSExpression | undefined) {
    super();
    this.expression = expression;
    this.result = result;
    this.results = [this.result];
    if (this.expression) {
      this.evalcontext = evalcontext.clone();
      this.uuid = this.evalcontext.storeRerollable(this);
    } else this.results = [result];
  }
  isEmpty(): boolean {
    return !this.result?.isRerollable() && this.result?.asString().length === 0;
  }
  asString(): string {
    return this.result.asString();
  }
  isRerollable(): boolean {
    return this.expression !== undefined;
  }
  isCollection(): boolean {
    return this.expression === undefined;
  }
  async reroll(): Promise<void> {
    this.evalcontext?.setToReroll();
    if (this.expression) {
      if (!this.evalcontext) throw Error('evalcontext not set for rerollable!');
      this.result = await this.expression.evaluate(this.evalcontext);
      const rerollableResult = this.result as RerollableTSExpressionResult;
      this.result = rerollableResult.result;
      this.results = [this.result];
    } else throw Error('Rerollable result cannot be rerolled, missing expression');
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
        if (
          !r.isCollection() &&
          !r.isRerollable() &&
          !r.isNote() &&
          !result._getLast()?.isCollection() &&
          !result._getLast()?.isRerollable() &&
          !result._getLast()?.isNote()
        ) {
          let prev = result.pop()?.asString();
          prev = prev === undefined ? '' : prev;
          result.addResult(new SingleTSExpressionResult(prev + r.asString()));
        } else result.addResult(r);
      }
    }
    if (result.size() === 1) return result.results[0];
    return result;
  }
  isCollection(): boolean {
    return true;
  }
  isEmpty(): boolean {
    return this.results.length === 0;
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
