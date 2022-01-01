import TSExpression from './tsexpression';

/**
 * Holds a single Tuple of a Key value pair for Select.
 */
class SelectTuple {
  key: TSExpression;
  value: TSExpression;
  constructor(key: TSExpression, value: TSExpression) {
    this.key = key;
    this.value = value;
  }
}

export default SelectTuple;
