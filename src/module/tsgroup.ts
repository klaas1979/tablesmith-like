import { evalcontext } from './expressions/evaluationcontextinstance';
import GroupCallModifierTerm from './expressions/terms/groupcallmodifierterm';
import InnerDiceTerm from './expressions/terms/innerdiceterm';
import IntTerm from './expressions/terms/intterm';
import Term from './expressions/terms/term';
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
  rangeAsProbabilty: boolean;
  nonRepeating: boolean;
  ranges: TSRange[];
  before: TSExpressions;
  after: TSExpressions;
  lastRollTotal: number | undefined;
  constructor(name: string, rangeAsProbability: boolean, nonRepeating: boolean) {
    this.name = name;
    this.rangeAsProbabilty = rangeAsProbability;
    this.nonRepeating = nonRepeating;
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
   * @returns number that represents the LastRoll on this group.
   */
  getLastRoll(): number {
    if (!this.lastRollTotal) throw `LastRoll not set for Group '${this.name}'`;
    return this.lastRollTotal;
  }

  /**
   * Checks if this group does return any result only once 'non repeating' or many teams 'normal' or 'repeating'.
   * @returns true if group is non repeating false otherwise.
   */
  isNonRepeating(): boolean {
    return this.nonRepeating;
  }
  /**
   * Returns the minimum value of this Group, i.e. the lower bound for the first range.
   * @returns min value that is contained in the ranges.
   */
  getMinValue(): number {
    return this.firstRange().getLower();
  }

  /**
   * Returns the maximum value of this Group, i.e. the upper bound for the last range.
   * @returns max value that is contained in the ranges.
   */
  getMaxValue(): number {
    return this.lastRange().getUpper();
  }

  /**
   * Rolls on this group using the provided modifier and returns the result.
   * @param groupCallModifier to modify rolls with.
   */
  roll(groupCallModifier: GroupCallModifierTerm): string {
    let result = undefined;
    const roller = groupCallModifier.modify(this.rollTerm());
    for (let i = 0; result === undefined && i < this.ranges.length * 10; i++) {
      const roll = roller.roll(evalcontext);
      let range: TSRange | undefined = this._rangeFor(roll.total);
      if (this.isNonRepeating()) {
        if (!range.isTaken()) range.lockout();
        else range = undefined;
      }
      if (range) {
        result = this.result(roll.total);
      }
    }
    // check if group is really maxed out or the 10*ranges sets have not found a match
    if (result == undefined) {
      const range = this.ranges.find((range) => {
        return !range.isTaken();
      });
      if (range) {
        range.lockout();
        result = this.result(range.getLower());
      }
    }
    return result != undefined ? result : '<Non repeating Group maxed out!>';
  }

  /**
   * Creates a Term that can be rolled upon in this table with current state of non Repeating ranges.
   * @returns Term for roll on this group.
   */
  private rollTerm(): Term {
    return new InnerDiceTerm(new IntTerm(1), new IntTerm(this.getMaxValue()));
  }

  /**
   * Returns text result for given roll including any defined before are afters in the group.
   * If result is below min range value returns first range, if above max returns
   * last ranges text.
   * @param rollResult The RollResult to lockup the groups text with.
   * @returns evaluated expression for Range donating result.
   */
  result(total: number): string {
    const result = this._rangeFor(total);
    this.lastRollTotal = total;
    return `${this.before.evaluate()}${result.evaluate()}${this.after.evaluate()}`;
  }

  /**
   * Unlocks all locked ranges for a non repeating group, normally used to set up context for next evaluation.
   */
  unlock(): void {
    if (this.isNonRepeating()) {
      this.ranges.forEach((range) => {
        range.unlock();
      });
    }
  }

  /**
   * Adds a new Range to Group starting after last range or with 1 if it is the first and going up to given value and
   * sets this Range up as current expressions to add to.
   * @param range the range to add to this group.
   * @returns the newly created range.
   */
  addRange(value: number): TSRange {
    const lower = this.lastRange() ? this.lastRange().upper + 1 : 1;
    const upper = this.rangeAsProbabilty ? lower + value - 1 : value;
    if (upper < lower)
      throw `Cannot add range to Group '${this.name}' value '${value}' results in range that is smaller than last range!`;
    const range = new TSRange(lower, upper);
    this.ranges.push(range);
    return range;
  }

  /**
   * Gets range for total results smaller than first range give first range and results large than last range
   * give the last range.
   * @param total to get range for.
   * @returns Range for total.
   */
  private _rangeFor(total: number): TSRange {
    let result;
    if (total < 1) {
      result = this.firstRange();
    } else if (total > this.getMaxValue()) {
      result = this.lastRange();
    } else {
      for (const range of this.ranges) {
        if (range.covers(total)) {
          result = range;
          break;
        }
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
