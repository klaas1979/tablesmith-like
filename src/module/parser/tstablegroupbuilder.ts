import TSGroup from '../tsgroup';
import TSRange from '../tsrange';
import TSExpression from '../expressions/tsexpression';
import ParserStack from './parserstack';

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
}

export default TSTableGroupBuilder;
