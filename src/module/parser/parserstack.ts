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
  ifFunctionNames: string[];
  booleanOperators: string[];
  ifFalseValuesAdded: boolean[];

  constructor() {
    this.stacked = [];
    this.booleanOperators = [];
    this.ifFunctionNames = [];
    this.ifFalseValuesAdded = [];
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

  /**
   * Pushes a new TSExpresions collection on stack and sets it as current.
   */
  stack(): void {
    if (this.assignment) throw 'Cannot stack Context within an unfinished assignment expression!';
    if (!this.current) throw 'Cannot stack Context if no current Expressions set!';
    this.stacked.push(this.current);
    this.current = new TSExpressions();
  }

  /**
   * Unstacks TSExpressions and sets it as current, old current is lost / forgotten. If nothing to unstack
   * throws an exception.
   * @returns new current TSExpressions for convenience.
   */
  unstack(): TSExpressions {
    if (this.assignment) throw 'Cannot unstack Context within an unfinished assignment expression!';
    this.current = this.stacked.pop();
    if (!this.current) throw 'Cannot unstack expressions stack is empty!';
    return this.current;
  }

  /**
   * Stacks context for an if expression.
   * @param ifname the name of the If expression to stack.
   */
  stackIf(ifname: string): void {
    this.ifFunctionNames.push(ifname);
    this.ifFalseValuesAdded.push(false);
    this.stack();
  }

  /**
   * Unstacks if operator and returns it.
   * @returns if operator from stack.
   */
  unstackIf(): string {
    const functionname = this.ifFunctionNames.pop();
    if (!functionname) throw 'No if functionname to unstack!';
    return functionname;
  }

  /**
   * Pushes given operator to stack of boolean comparison operators. And stacks expression Context as well.
   * @param operator to stack for a boolean expression.
   */
  stackBooleanOperator(operator: string) {
    this.booleanOperators.push(operator);
    this.stack();
  }

  /**
   * Unstacks if operator and returns it, leaves expression context untouched.
   * @returns if operator from stack.
   */
  unstackBooleanOperator(): string {
    const op = this.booleanOperators.pop();
    if (!op) throw 'No boolean comparison operator to unstack!';
    return op;
  }

  /**
   * Stacks context for false value and stores that it has done this, to ensure that context is popped later.
   */
  stackIfFalseValue(): void {
    this.stack();
    this.ifFalseValuesAdded.pop();
    this.ifFalseValuesAdded.push(true);
  }

  unstackIfFalseValueAdded(): boolean {
    const added = this.ifFalseValuesAdded.pop();
    if (added == undefined) throw 'No falseValuedAdded in stack, cannot unstack!';
    return added;
  }
}

export default ParserStack;
