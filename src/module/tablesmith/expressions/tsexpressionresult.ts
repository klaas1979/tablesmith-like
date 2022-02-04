/**
 * Tablesmith expressions result is the result a single expression evaluates to. It provides
 * som convenience methods to interact with the result.
 */
export default class TSExpressionResult {
  private result: string;
  constructor(result: TSExpressionResult | string | number) {
    this.result = `${result}`;
  }

  /**
   * Returns result as string.
   * @returns result as String.
   */
  asString(): string {
    return this.result;
  }

  /**
   * Returns result as trimmed string.
   * @returns result as trimmed string.
   */
  trim(): string {
    return this.result.trim();
  }

  /**
   * Returns result as parsed number, throws if NaN.
   * @returns result as number.
   */
  asNumber(): number {
    const num = Number.parseFloat(this.result);
    if (Number.isNaN(num)) throw Error(`Could not parse number as float '${this.result}'!`);
    return num;
  }

  /**
   * Returns result as parsed int, throws if NaN.
   * @returns result as parsed int.
   */
  asInt(): number {
    const num = Number.parseInt(this.result);
    if (Number.isNaN(num)) throw Error(`Could not parse number as int '${this.result}'!`);
    return num;
  }
}
