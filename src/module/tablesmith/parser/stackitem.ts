import TSExpression from '../expressions/tsexpression';
import TSExpressions from '../expressions/tsexpressions';
import STACK_TYPE from './stacktype';

/**
 * A stacked function is a TS Function that has been started, i.e. {NAME~....}.
 * It stacks the expressions that are contained within as parameters.
 */
class StackItem {
  type: STACK_TYPE;
  name: string;
  rerollable = false;
  strings: string[];
  expressionsStack: TSExpressions[];
  mathSumOperators: string[];
  mathMultOperators: string[];
  constructor(expressions: TSExpressions, type: STACK_TYPE, name = '') {
    this.type = type;
    this.name = name;
    this.strings = [];
    this.expressionsStack = [];
    this.mathSumOperators = [];
    this.mathMultOperators = [];
    this.expressionsStack.push(expressions);
  }

  /**
   * Stacks a new TSExpressions list to add to.
   */
  stack(): void {
    this.expressionsStack.push(new TSExpressions());
  }

  /**
   * Stacks a new TSExpressions list to given index.
   */
  stackAt(index: number): void {
    if (index > this.expressionsStack.length) throw Error(`Cannot stackAt index '${index}' out of bounds!`);
    this.expressionsStack.splice(index, 0, new TSExpressions());
  }

  /**
   * Unshifts a new TSExpressions list at beginning
   */
  unshift(): void {
    this.expressionsStack.unshift(new TSExpressions());
  }

  /**
   * Stacks a string value.
   * @param value to stack.
   */
  stackString(value: string): void {
    this.strings.push(value);
  }

  /**
   * Stacks low binding operator like +, -.
   * @param operator to stack.
   */
  stackMathSumOperator(operator: string): void {
    this.mathSumOperators.push(operator);
  }

  /**
   * Stacks high binding operator like *, /
   * @param operator to stack.
   */
  stackMathMultOperator(operator: string): void {
    this.mathMultOperators.push(operator);
  }

  /**
   * Shifts a math sum operator from list, bottom of stack and returns it.
   * @returns first operator in list.
   */
  shiftMathSumOperator(): string {
    const result = this.mathSumOperators.shift();
    if (result == undefined) throw Error('Could not shift math sum operator, stack is empty!');
    return result;
  }

  /**
   * Shifts a math mult operator from list, bottom of stack and returns it.
   * @returns first operator in list.
   */
  shiftMathMultOperator(): string {
    const result = this.mathMultOperators.shift();
    if (result == undefined) throw Error('Could not shift math mult operator, stack is empty!');
    return result;
  }

  /**
   * Checks if this StackItem is empty.
   * @returns true if empty, containing no data, false if any data contained.
   */
  isEmpty(): boolean {
    const stackEmpty = this.stackSize() == 0;
    const stringsEmpty = this.strings.length == 0;
    return stackEmpty && stringsEmpty;
  }

  /**
   * Returns size of expresions.
   * @returns Size of TSExpressions in stack.
   */
  stackSize(): number {
    return this.expressionsStack.length;
  }

  /**
   * Gives numbe of stacked Strings.
   * @returns number of stacked strings.
   */
  stringSize(): number {
    return this.strings.length;
  }

  /**
   * Gives number of stacked Sum Operators.
   * @returns number of stacked operators.
   */
  mathSumSize(): number {
    return this.mathSumOperators.length;
  }
  /**
   * Gives number of stacked Mult Operators.
   * @returns number of stacked operators.
   */
  mathMultSize(): number {
    return this.mathMultOperators.length;
  }

  /**
   * String summary of this stack item.
   * @returns Summary of this Stack Item.
   */
  summary(): string {
    const stringRep = this.strings.join(',');
    let expressionsRep = '';
    this.expressionsStack.forEach((expr) => {
      if (expressionsRep.length > 0) expressionsRep += ',';
      expressionsRep += expr.getExpression();
    });
    return `Type=${this.type}, name=${this.name}, strings=${stringRep}, expressionsStack=${expressionsRep}`;
  }

  /**
   * Pushs given expression to TSExpressions on top of stack.
   * @param expression to add.
   */
  pushExpressionToLast(expression: TSExpression) {
    this.peekExpressions().push(expression);
  }

  /**
   * Pushs given expression to TSExpressions at given index of stack.
   * @param index of stack item to push Expression to.
   * @param expression to add.
   */
  pushExpressionTo(index: number, expression: TSExpression) {
    if (index > this.expressionsStack.length)
      throw Error(`Could not push to index '${index}', length '${this.expressionsStack.length}'`);
    this.expressionsStack[index].push(expression);
  }

  /**
   * Pushs all included expressions to this TSEspressions.
   * @param expressions to pop and add to this stack.
   */
  pushExpressionsToLast(expressions: TSExpressions) {
    let expression;
    while ((expression = expressions.expressions.pop())) {
      this.peekExpressions().push(expression);
    }
  }

  /**
   * Returns TSExpressions at start of list (at bottom of stack).
   * @returns TSExpressions at start of list.
   */
  firstExpressions(): TSExpressions {
    if (this.expressionsStack.length == 0) throw Error('Cannot get firstExpressions stack is empty!');
    return this.expressionsStack[0];
  }

  /**
   * Returns TSExpressions on top of stack, without removing it.
   * @returns TSExpressions on top of stack.
   */
  peekExpressions(): TSExpressions {
    if (this.expressionsStack.length == 0) throw Error('Cannot peekExpressions stack is empty!');
    return this.expressionsStack[this.expressionsStack.length - 1];
  }

  /**
   * Pops expressions from top of stack and returns it, throws if stack is empty.
   * @returns TSExpressions on top of stack.
   */
  popExpressions(): TSExpressions {
    const result = this.expressionsStack.pop();
    if (result == undefined) throw Error('Could not pop expressions, stack is empty!');
    return result;
  }

  /**
   * Pops expressions at given index, throws if stack out of bounds.
   * @param index to pull.
   * @returns TSExpressions at index.
   */
  pullExpressionsAt(index: number): TSExpressions {
    if (this.expressionsStack.length <= index)
      throw Error(`Could not pull at index '${index}', length '${this.expressionsStack.length}'`);
    const result = this.expressionsStack.splice(index, 1);
    return result[0];
  }

  /**
   * Adds given expression to top of stack.
   * @param expression to add to Expressions on top of stack.
   */
  addString(value: string) {
    this.strings.push(value);
  }

  /**
   * Returns string on top of stack, without removing it.
   * @returns TSExpressions on top of stack.
   */
  peekString(): string {
    return this.strings[this.strings.length - 1];
  }

  /**
   * Pops string from top of stack and returns it, throws if stack is empty.
   * @returns string on top of stack.
   */
  popString(): string {
    const result = this.strings.pop();
    if (result == undefined) throw Error('Could not pop string, stack is empty!');
    return result;
  }
}

export default StackItem;
