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
  strings: string[];
  expressionsStack: TSExpressions[];
  constructor(expressions: TSExpressions, type: STACK_TYPE, name = '') {
    this.type = type;
    this.name = name;
    this.strings = [];
    this.expressionsStack = [];
    this.expressionsStack.push(expressions);
  }

  /**
   * Stacks a new TSExpressions list to add to.
   */
  stack(): void {
    this.expressionsStack.push(new TSExpressions());
  }

  /**
   * Stacks a string value.
   * @param value to stack.
   */
  stackString(value: string): void {
    this.strings.push(value);
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
   * Adds given expression to TSExpressions on top of stack.
   * @param expression to add.
   */
  addExpression(expression: TSExpression) {
    this.peekExpressions().add(expression);
  }

  /**
   * Returns TSExpressions on top of stack, without removing it.
   * @returns TSExpressions on top of stack.
   */
  peekExpressions(): TSExpressions {
    return this.expressionsStack[this.expressionsStack.length - 1];
  }

  /**
   * Pops expressions from top of stack and returns it, throws if stack is empty.
   * @returns TSExpressions on top of stack.
   */
  popExpressions(): TSExpressions {
    const result = this.expressionsStack.pop();
    if (result == undefined) throw 'Could not pop expressions, stack is empty!';
    return result;
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
    if (result == undefined) throw 'Could not pop string, stack is empty!';
    return result;
  }
}

export default StackItem;
