import RollResult from './expressions/rollresult';
import TSExpression from './expressions/tsexpression';
import TSExpressions from './expressions/tsexpressions';
import TSRange from './tsrange';
/**
 * TSGroup is a Group within a Table. In Tablesmith it looks like:
 * :name
 * < before value, can be omitted
 * > after value, can be omitted
 * 1,Value
 * 2,other value
 * 3-5, other
 * 10, more
 * This groups are rolled upon and are the most important building blocks within a Table.
 */
class TSGroup {
  name: string;
  ranges: TSRange[];
  before: TSExpressions;
  after: TSExpressions;
  current: TSExpressions | undefined;
  lastRoll: RollResult | undefined;
  constructor(name: string) {
    this.name = name;
    this.ranges = [];
    this.before = new TSExpressions();
    this.after = new TSExpressions();
    this.current = undefined;
  }

  /**
   * Returns this group's name.
   * @returns Group name, unique within a table.
   */
  getName(): string {
    return this.name;
  }

  /**
   * Returns array of all ranges within the group. The Ranges are sorted by value.
   * @returns Array containing all ranges of the group.
   */
  getRanges(): TSRange[] {
    return this.ranges;
  }

  /**
   * Returns the TSExpressions setup as before for this group.
   * @returns The TSExpressions making up the before for each table result.
   */
  getBefore(): TSExpressions {
    return this.before;
  }

  /**
   * Returns the TSExpressions setup as after for this group.
   * @returns The TSExpressions making up the after for each table result.
   */
  getAfter(): TSExpressions {
    return this.after;
  }

  /**
   * The currently edited expressions collection to add expressions to, can be from before, after or group.
   * @returns Returns the currently added TSExpression to add expressions to.
   */
  getCurrentExpressions(): TSExpressions {
    if (!this.current) throw `No range nor a before '<' or after '>' setup for group '${this.name}'`;
    return this.current;
  }

  /**
   * Returns the last roll made on this group, or throws if not rolled and called.
   * @returns RollResult that represents the LastRoll on this group.
   */
  getLastRoll(): RollResult {
    if (!this.lastRoll) throw `LastRoll not set for Group '${this.name}'`;
    return this.lastRoll;
  }

  /**
   * Returns the maximum value of this Group, i.e. the upper bound for the last range.
   * @returns max value that is contained in the ranges.
   */
  getMaxValue(): number {
    return this._lastRange().getUpper();
  }

  /**
   * Returns text result for given roll including any defined before are afters in the group.
   * If result is below min range value returns first range, if above max returns
   * last ranges text.
   * @param rollResult The RollResult to lockup the groups text with.
   * @returns evaluated expression for Range donating result.
   */
  result(rollResult: RollResult): string {
    this.lastRoll = rollResult;
    let result;
    if (rollResult.total < 1) {
      result = this._firstRange();
    } else if (rollResult.total > this.getMaxValue()) {
      result = this._lastRange();
    } else {
      result = this._rangeFor(rollResult.total);
    }
    if (!result)
      throw `Could not get result for Group '${this.name}' roll='${rollResult.total}' maxValue=${this.getMaxValue()}`;
    return `${this.before.getText()}${result.getText()}${this.after.getText()}`;
  }

  /**
   * Adds a new Range to Group starting after last range or 1 if it is the first and going up to given value and
   * sets this Range up as current expressions to add to.
   * @param upper the number donating the new ranges max value.
   */
  addRange(upper: number): void {
    const lower = this.ranges.length > 0 ? this._lastRange().upper + 1 : 1;
    const range = new TSRange(lower, upper);
    this.ranges.push(range);
    this.current = range.getExpressions();
  }

  /**
   * Helper setting up the current expressions to add to, to before.
   */
  addBefore(): void {
    this.current = this.before;
  }

  /**
   * Helper setting up the current expressions to add to, to after.
   */
  addAfter(): void {
    this.current = this.after;
  }

  /**
   * Adds expression to currently setup expressions, that can be a Range or a before or after part.
   * @param expression to add to this group.
   */
  addExpression(expression: TSExpression): void {
    expression.setGroup(this);
    this.getCurrentExpressions().add(expression);
  }

  private _rangeFor(total: number): TSRange {
    let result;
    // eslint-disable-next-line prefer-const
    for (let range of this.ranges) {
      if (range.covers(total)) {
        result = range;
        break;
      }
    }
    if (!result) throw `Group='${this.name}' could not get TSRange for value=${total}`;

    return result;
  }

  private _firstRange(): TSRange {
    return this.ranges[0];
  }

  private _lastRange(): TSRange {
    return this.ranges[this.ranges.length - 1];
  }
}

export default TSGroup;
