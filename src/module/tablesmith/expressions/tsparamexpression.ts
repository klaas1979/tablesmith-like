import TSGroup from '../tsgroup';
import { TableParameter } from '../tstable';
import TSExpression from './tsexpression';
import TSExpressionResult from './tsexpressionresult';

/**
 * Param Expression that returns value for index of a param list.
 */
class TSParamExpression implements TSExpression {
  varExpression: TSExpression;
  indexExpression: TSExpression;
  parameters: TableParameter[];

  constructor(varExpression: TSExpression, indexExpression: TSExpression, parameters: TableParameter[]) {
    this.varExpression = varExpression;
    this.indexExpression = indexExpression;
    this.parameters = parameters;
  }

  evaluate(): TSExpressionResult {
    const variable = this.varExpression.evaluate().asString().trim();
    const index = this.evaluateIndex();
    const param = this.parameters.find((param) => {
      return param.variable == variable;
    });
    if (!param) throw `No param for variable name '${variable}'`;
    if (index < 1 || index > param.options.length)
      throw `Index for Options of variable '${variable}' out of bounds was '${index}' allowed '1-${param.options.length}'`;
    return new TSExpressionResult(param.options[index - 1].value);
  }

  private evaluateIndex(): number {
    return this.indexExpression.evaluate().asInt();
  }

  getExpression(): string {
    return `{Param~${this.varExpression.getExpression()},${this.indexExpression.getExpression()}%}`;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setGroup(group: TSGroup): void {
    // empty
  }
}

export default TSParamExpression;
