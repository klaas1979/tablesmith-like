class RollResult {
  sides: number;
  modifier: number;
  roll: number;
  total: number;
  constructor(sides: number, roll: number, modifier = 0) {
    this.sides = sides;
    this.roll = roll;
    this.modifier = modifier;
    this.total = roll + modifier;
  }
}

export default RollResult;
