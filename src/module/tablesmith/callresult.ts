import { TableCallValues } from '../foundry/tablecallvalues';
import { TSExpressionResult } from './expressions/tsexpressionresult';

/**
 * Result of a Tablesmith call evalutation, can contain one or many results
 * from the evaluation of the same table.
 */
export default class CallResult {
  private results: TSExpressionResult[] = [];
  private tableCallValues: TableCallValues | undefined;
  private call: string | undefined;
  private errorMessage = '';
  constructor(callValues: TableCallValues | string) {
    if (typeof callValues === 'string') this.call = callValues;
    else this.tableCallValues = callValues;
  }

  /**
   * Checks if result is error or not.
   * @returns boolean if result evaluation encountered an error.
   */
  isError(): boolean {
    return this.errorMessage !== undefined && this.errorMessage.length > 0;
  }

  /**
   * Sets Error message, if an error did occur while result was evaluated.
   * @param message to set as error message.
   */
  setErrorMessage(message: string) {
    this.errorMessage = message;
  }

  /**
   * Returns the error message for this result.
   * @returns error message of this result, empty string if no error.
   */
  getErrorMessage() {
    return this.errorMessage;
  }

  /**
   * Iterates of all results with given callback function.
   * @param callbackFn for iteration.
   */
  forEach(callbackFn: (result: TSExpressionResult, index: number) => void) {
    this.results.forEach(callbackFn);
  }

  /**
   * Converts result to string.
   * @returns string representation of this result.
   */
  asString(): string | string[] {
    const array = this.results.map((r) => {
      return r.asString();
    });
    return array.length === 1 ? array[0] : array;
  }

  /**
   * Adds given result to collection.
   * @param result to add to collection.
   */
  push(result: TSExpressionResult): void {
    this.results.push(result);
  }

  /**
   * Retrieves result.
   * @param index to get result for.
   * @returns TSExpressionResult for index.
   */
  get(index: number): TSExpressionResult {
    return this.results[index];
  }

  /**
   * Returns number of results.
   * @returns number of results contained.
   */
  size(): number {
    return this.results.length;
  }
}
