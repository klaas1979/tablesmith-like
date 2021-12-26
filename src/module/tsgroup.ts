import RollResult from './expressions/rollresult';
import TSRange from './tsrange';
/**
 * TSGroup is a Group within a Table. In Tablesmith it looks like:
 * :name
 * 1,Value
 * 2,other value
 * 3-5, other
 * 10, more
 * This groups are rolled upon and are the most important building blocks within a Table.
 */
class TSGroup {
  name: string;
  ranges: TSRange[];
  constructor(name: string) {
    this.name = name;
    this.ranges = [];
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
   * Last range is the current one, needed to setup a group and add content to it.
   * @returns Returns the currently added range, the last one.
   */
  getCurrentRange(): TSRange {
    if (this.ranges.length == 0) throw `No range defined for group '${this.name}'`;
    return this._lastRange();
  }

  /**
   * Returns the maximum value of this Group, i.e. the upper bound for the last range.
   * @returns max value that is contained in the ranges.
   */
  getMaxValue(): number {
    return this._lastRange().getUpper();
  }

  /**
   * Returns text result for given roll. If result is below min range value returns first range, if above max returns
   * last ranges text.
   * @param rollResult The RollResult to lockup the groups text with.
   * @returns evaluated expression for Range donating result.
   */
  result(rollResult: RollResult): string {
    let result;
    // eslint-disable-next-line prefer-const
    if (rollResult.total < 1) {
      result = this._firstRange();
    } else if (rollResult.total > this.getMaxValue()) {
      result = this._lastRange();
    } else {
      result = this._rangeFor(rollResult.total);
    }
    if (!result)
      throw `Could not get result for Group '${this.name}' roll='${rollResult.total}' maxValue=${this.getMaxValue()}`;
    return result.getText();
  }

  /**
   * Adds a new Range to Group starting after last range or 1 if it is the first and going up to given value.
   * @param upper the number donating the new ranges max value.
   */
  addRange(upper: number): void {
    const lower = this.ranges.length > 0 ? this._lastRange().upper + 1 : 1;
    this.ranges.push(new TSRange(lower, upper));
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
