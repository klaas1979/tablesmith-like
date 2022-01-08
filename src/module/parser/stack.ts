import TSExpression from '../expressions/tsexpression';
import TSExpressions from '../expressions/tsexpressions';
import StackItem from './stackitem';
import STACK_TYPE from './stacktype';

/**
 * The ParserStack holds the current state to add expressions to. It is stacks contexts for nested
 * expressions as needed to group the parsed Expressions into their intended tree / hierachy.
 * Provides functionality to addExpressions and manage the stack.
 */
class Stack {
  stacked: StackItem[];
  constructor() {
    this.stacked = [];
  }

  /**
   * Adds the current expression to the current list of expressions.
   * @param expression to add.
   */
  addExpression(expression: TSExpression) {
    this.peek().addExpression(expression);
  }

  /**
   * Starts a new Range, before or after in Group.
   * @param expressions to use as start for new ranges expression stack.
   */
  startGroupLine(expressions: TSExpressions) {
    if (this.stacked.length > 0 && this.peek().stackSize() > 1) throw 'Stack is not empty, cannot start a new Range!';
    this.stacked.pop(); // remove last range, if exists
    const rangeStack = new StackItem(expressions, STACK_TYPE.RANGE);
    this.stacked.push(rangeStack);
  }

  /**
   * Starts a new Variable get or set Expression.
   */
  startVariable(type: 'get' | 'set') {
    if (this.stacked.length == 0) throw `Stack is empty, cannot start new variable assignment!`;
    const stackType = type == 'set' ? STACK_TYPE.VARIABLE_SET : STACK_TYPE.VARIABLE_GET;
    const rangeStack = new StackItem(new TSExpressions(), stackType);
    this.stacked.push(rangeStack);
  }

  /**
   * Starts a new Function Expression.
   */
  startFunction(name: string) {
    if (this.stacked.length == 0) throw `Stack is empty, cannot start new function '${name}'!`;
    const rangeStack = new StackItem(new TSExpressions(), STACK_TYPE.FUNCTION, name);
    this.stacked.push(rangeStack);
  }

  /**
   * Stacks a new parameter for current StackItem.
   */
  stackParameter() {
    this.peek().stack();
  }

  /**
   * Stacks a string value in current StackItem.
   * @param value to stack to strings.
   */
  stackString(value: string) {
    this.peek().stackString(value);
  }

  pop(): StackItem {
    const result = this.stacked.pop();
    if (!result) throw 'Could not pop from stack, nothing stacked!';
    return result;
  }

  /**
   * Peeks into Stack without removing item.
   * @returns Top item from stack.
   */
  peek(): StackItem {
    return this.stacked[this.stacked.length - 1];
  }
}

export default Stack;
