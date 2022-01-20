import TSGroup from '../tsgroup';
import { TableParameter } from '../tstable';
import TSExpression from './tsexpression';

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

  evaluate(): string {
    const variable = this.varExpression.evaluate().trim();
    const index = this.evaluateIndex();
    const param = this.parameters.find((param) => {
      return param.variable == variable;
    });
    if (!param) throw `No param for variable name '${variable}'`;
    if (index < 1 || index > param.options.length)
      throw `Index for Options of variable '${variable}' out of bounds was '${index}' allowed '1-${param.options.length}'`;
    return param.options[index - 1].value;
  }

  private evaluateIndex(): number {
    const index = this.indexExpression.evaluate();
    const indexNum = Number.parseInt(index);
    if (Number.isNaN(indexNum)) throw `Index was '${index}' must be integer from 1 to max number of selecteable values`;
    return indexNum;
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
