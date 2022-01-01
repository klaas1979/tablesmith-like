import RollResult from './expressions/rollresult';
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
  lastRoll: RollResult | undefined;
  constructor(name: string) {
    this.name = name;
    this.ranges = [];
    this.before = new TSExpressions();
    this.after = new TSExpressions();
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
    return this.lastRange().getUpper();
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
      result = this.firstRange();
    } else if (rollResult.total > this.getMaxValue()) {
      result = this.lastRange();
    } else {
      result = this._rangeFor(rollResult.total);
    }
    if (!result)
      throw `Could not get result for Group '${this.name}' roll='${rollResult.total}' maxValue=${this.getMaxValue()}`;
    return `${this.before.evaluate()}${result.evaluate()}${this.after.evaluate()}`;
  }

  /**
   * Adds a new Range to Group starting after last range or with 1 if it is the first and going up to given value and
   * sets this Range up as current expressions to add to.
   * @param range the range to add to this group.
   */
  addRange(range: TSRange): void {
    const minLower = this.ranges.length > 0 ? this.lastRange().upper + 1 : 1;
    if (range.lower != minLower)
      throw `Could not add range with gap or overlap in bounds got '${range.lower}-${range.upper}' minimum lower '${minLower}'`;
    this.ranges.push(range);
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

  /**
   * Returns first Range of this group.
   * @returns the first range of this Group.
   */
  firstRange(): TSRange {
    return this.ranges[0];
  }
  /**
   * Returns the last range of this group.
   * @returns the last Range of this group.
   */
  lastRange(): TSRange {
    return this.ranges[this.ranges.length - 1];
  }
}

export default TSGroup;
