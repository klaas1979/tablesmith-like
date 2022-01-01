import TSGroup from '../tsgroup';
import TSRange from '../tsrange';
import TSExpression from '../expressions/tsexpression';
import TSExpressions from '../expressions/tsexpressions';
import TSVariableSetExpression from '../expressions/tsvariablesetexpression';

/**
 * Group Builder is the main helper for Tablesmith parsing to hold togehter the context of a single TSGroup
 * that belongs to a table. The helper holds all needed state and stacks of contexts for parsing purpose.
 */
class TSTableGroupBuilder {
  tsGroup: TSGroup;
  range: TSRange | undefined;
  current: TSExpressions | undefined;
  assignment: TSExpressions | undefined;
  stacked: TSExpressions[];
  constructor(group: TSGroup) {
    this.tsGroup = group;
    this.stacked = [];
  }

  /**
   * Adds a new Range to Group starting after last range or 1 if it is the first and going up to given value and
   * sets this Range up as current expressions to add to.
   * @param upper the number donating the new ranges max value.
   */
  addRange(upper: number): void {
    const lower = this.tsGroup.lastRange() ? this.tsGroup.lastRange().upper + 1 : 1;
    this.range = new TSRange(lower, upper);
    this.current = this.range.getExpressions();
    this.tsGroup.addRange(this.range);
  }

  /**
   * Adds expression to currently setup expressions, that can be a Range or a before or after part.
   * @param expression to add to this group.
   */
  addExpression(expression: TSExpression): void {
    expression.setGroup(this.tsGroup);
    this.addAssignmentExpressionsIfExists(expression);
    this.getCurrentExpressions().add(expression);
  }

  /**
   * If assignment expressions exists, adds them to the given expression.
   * @param expression to existing assignment expressions to.
   */
  private addAssignmentExpressionsIfExists(expression: TSExpression) {
    if (this.assignment) {
      const setExpression = expression as TSVariableSetExpression;
      if (typeof setExpression.setValueExpressions === 'function') {
        setExpression.setValueExpressions(this.assignment);
        this.assignment = undefined;
      }
    }
  }

  /**
   * The currently edited expressions collection to add expressions to, can be from before, after or group.
   * @returns Returns the currently added TSExpression to add expressions to.
   */
  getCurrentExpressions(): TSExpressions {
    if (!this.current) throw `No range nor before or after defined for Group '${this.tsGroup.getName()}'`;
    return this.current;
  }

  /**
   * Helper setting up the current expressions to add to the before expressions of the group.
   */
  addBefore(): void {
    this.current = this.tsGroup.before;
  }

  /**
   * Helper setting up the current expressions to add to the after expressions of the group.
   */
  addAfter(): void {
    this.current = this.tsGroup.after;
  }

  /**
   * Toggles variable assignment Context on and off. If toggled on the Expressions are collected
   * for the variable assignment and the current expressions stacked away. If toggled of the old expression stack
   * is restored to save Expressions following variable assignment.
   */
  toggleVariableAssigment(): void {
    if (!this.assignment) this.startVariableAssignment();
    else this.endVariableAssignment();
  }

  private startVariableAssignment(): void {
    if (!this.current)
      throw `Cannot start variable assignment no range nor before or after set for group '${this.tsGroup.getName()}'`;
    this.stacked.push(this.current);
    this.assignment = new TSExpressions();
    this.current = this.assignment;
  }

  private endVariableAssignment(): void {
    this.current = this.stacked.pop();
  }
}

export default TSTableGroupBuilder;
