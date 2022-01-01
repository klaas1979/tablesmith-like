import TSGroup from '../tsgroup';
import TSRange from '../tsrange';
import TSExpression from '../expressions/tsexpression';
import ParserStack from './parserstack';
import TSIfExpression from '../expressions/tsifexpression';
import TSExpressions from '../expressions/tsexpressions';

/**
 * Group Builder is the main helper for Tablesmith parsing to hold togehter the context of a single TSGroup
 * that belongs to a table. The helper holds all needed state and stacks of contexts for parsing purpose.
 */
class TSTableGroupBuilder {
  tsGroup: TSGroup;
  range: TSRange | undefined;
  stack: ParserStack;
  constructor(group: TSGroup, stack: ParserStack) {
    this.tsGroup = group;
    this.stack = stack;
  }

  /**
   * Adds a new Range to Group starting after last range or 1 if it is the first and going up to given value and
   * sets this Range up as current expressions to add to.
   * @param upper the number donating the new ranges max value.
   */
  addRange(upper: number): void {
    const lower = this.tsGroup.lastRange() ? this.tsGroup.lastRange().upper + 1 : 1;
    this.range = new TSRange(lower, upper);
    this.stack.current = this.range.getExpressions();
    this.tsGroup.addRange(this.range);
  }

  /**
   * Adds expression to currently setup expressions, that can be a Range or a before or after part.
   * @param expression to add to this group.
   */
  addExpression(expression: TSExpression): void {
    expression.setGroup(this.tsGroup);
    this.stack.addExpression(expression);
  }

  /**
   * Helper setting up the current expressions to add to the before expressions of the group.
   */
  addBefore(): void {
    this.stack.current = this.tsGroup.before;
  }

  /**
   * Helper setting up the current expressions to add to the after expressions of the group.
   */
  addAfter(): void {
    this.stack.current = this.tsGroup.after;
  }

  /**
   * Toggles variable assignment Context on and off. If toggled on the Expressions are collected
   * for the variable assignment and the current expressions stacked away. If toggled of the old expression stack
   * is restored to save Expressions following variable assignment.
   */
  toggleVariableAssigment(): void {
    this.stack.toggleVariableAssigment();
  }

  /**
   * Starts an If expression.
   * @param functionname of the If can be "If" or "IIf".
   */
  startIf(functionname: string) {
    this.stack.stackIf(functionname);
  }

  /**
   * Sets the operator used in boolean expression of If.
   * @param operator to set for if boolean expression.
   */
  setIfOperator(operator: string) {
    this.stack.stackIfOperator(operator);
  }

  /**
   * Starts the true value Expressions for the if.
   */
  startIfTrueValue(): void {
    this.stack.stack();
  }

  /**
   * Starts the true value Expressions for the if.
   */
  startIfFalseValue(): void {
    this.stack.stackIfFalseValue();
  }

  /**
   * Creates if Expression from last stacked values and returns it.
   * @returns TSIfExpression If Expression on top of stack.
   */
  createIf(): TSIfExpression {
    let falseVal, trueVal;
    if (this.stack.unstackIfFalseValueAdded()) {
      falseVal = this.stack.getCurrentExpressions();
      trueVal = this.stack.unstack();
    } else {
      falseVal = new TSExpressions();
      trueVal = this.stack.getCurrentExpressions();
    }
    const ifExpression2 = this.stack.unstack();
    const ifExpression1 = this.stack.unstack();
    const operator = this.stack.unstackIfOperator();
    const functionName = this.stack.unstackIf();
    this.stack.unstack(); // pop out the last if, to be back to previous context
    return new TSIfExpression(functionName, ifExpression1, operator, ifExpression2, trueVal, falseVal);
  }
}

export default TSTableGroupBuilder;
