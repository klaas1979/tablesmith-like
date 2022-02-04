import { TableParameter } from '../tstable';
import TSExpression, { BaseTSExpression } from './tsexpression';
import TSExpressionResult from './tsexpressionresult';

/**
 * Param Expression that returns value for index of a param list.
 */
export default class TSParamExpression extends BaseTSExpression {
  varExpression: TSExpression;
  indexExpression: TSExpression;
  parameters: TableParameter[];

  constructor(varExpression: TSExpression, indexExpression: TSExpression, parameters: TableParameter[]) {
    super();
    this.varExpression = varExpression;
    this.indexExpression = indexExpression;
    this.parameters = parameters;
  }

  async evaluate(): Promise<TSExpressionResult> {
    const variable = (await this.varExpression.evaluate()).asString().trim();
    const index = await this.evaluateIndex();
    const param = this.parameters.find((param) => {
      return param.variable == variable;
    });
    if (!param) throw Error(`No param for variable name '${variable}'`);
    if (index < 1 || index > param.options.length)
      throw Error(
        `Index for Options of variable '${variable}' out of bounds was '${index}' allowed '1-${param.options.length}'`,
      );
    return new TSExpressionResult(param.options[index - 1].value);
  }

  private async evaluateIndex(): Promise<number> {
    return (await this.indexExpression.evaluate()).asInt();
  }

  getExpression(): string {
    return `{Param~${this.varExpression.getExpression()},${this.indexExpression.getExpression()}}`;
  }
}
