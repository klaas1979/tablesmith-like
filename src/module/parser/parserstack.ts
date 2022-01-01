import TSExpression from '../expressions/tsexpression';
import TSExpressions from '../expressions/tsexpressions';
import TSVariableSetExpression from '../expressions/tsvariablesetexpression';

/**
 * The ParserStack holds the current state to add expressions to. It is stacks contexts for nested
 * expressions as needed to group the parsed Expressions into their intended tree / hierachy.
 * Provides functionality to addExpressions and manage the stack.
 */
class ParserStack {
  current: TSExpressions | undefined;
  assignment: TSExpressions | undefined;
  stacked: TSExpressions[];
  constructor() {
    this.stacked = [];
  }

  /**
   * Adds expression to currently setup expressions, that can be a Range or a before or after part.
   * @param expression to add to this group.
   */
  addExpression(expression: TSExpression): void {
    this.ifAssignmentExpressionAddSetExpressionsAndUnstack(expression);
    this.getCurrentExpressions().add(expression);
  }

  /**
   * If currently parsing an assignment expressions and given expression is the assignment expression
   * adds collected expressions that make up the assignment to it and resets state.
   * @param expression to existing assignment expressions to.
   */
  private ifAssignmentExpressionAddSetExpressionsAndUnstack(expression: TSExpression) {
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
    if (!this.current) throw `No current TSExpressions setup!`;
    return this.current;
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
    if (!this.current) throw `Cannot start variable assignment no current expresions set!'`;
    this.stacked.push(this.current);
    this.assignment = new TSExpressions();
    this.current = this.assignment;
  }

  private endVariableAssignment(): void {
    this.current = this.stacked.pop();
  }
}

export default ParserStack;
