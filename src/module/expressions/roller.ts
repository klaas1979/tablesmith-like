import RollResult from './rollresult';
import twist from './mersennetwister';

/**
 * Random number roll helper for all type of rolls on Groups or in functions.
 */
class Roller {
  rolls: RollResult[];
  constructor() {
    this.rolls = [];
  }

  /**
   * Rolls as defined and returns result.
   * @param sides number of sides for die to roll.
   * @param modifier optional, modifier to add/subtract from roll.
   * @returns RollResult for roll.
   */
  roll(sides: number, modifier = 0): RollResult {
    const random = twist.random();
    const result = new RollResult(sides, Math.ceil(random * sides), modifier);
    this.rolls.push(result);
    return result;
  }
}

export default Roller;
