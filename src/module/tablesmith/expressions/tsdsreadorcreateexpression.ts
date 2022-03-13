import TSExpression, { BaseTSExpression } from './tsexpression';
import { TSExpressionResult } from './tsexpressionresult';
import EvaluationContext from './evaluationcontext';
import DSFieldExpression from './dsfieldexpression';
import TSDSStoreExpression from './tsdsstoreexpression';
import TSDSCreateExpression from './tsdscreateexpression';

/**
 * Class for TS-Function DSCreate, creating Dataset with default values.
 */
export default class TSDSReadOrCreateExpression extends BaseTSExpression {
  private storeVariableExpression: TSExpression;
  private storenameExpression: TSExpression;
  private fieldsExpressions: DSFieldExpression[];
  constructor(
    storeVariableExpression: TSExpression,
    storenameExpression: TSExpression,
    fieldsExpressions: DSFieldExpression[],
  ) {
    super();
    this.storeVariableExpression = storeVariableExpression;
    this.storenameExpression = storenameExpression;
    this.fieldsExpressions = fieldsExpressions;
  }
  async evaluate(evalcontext: EvaluationContext): Promise<TSExpressionResult> {
    let result;
    try {
      const read = new TSDSStoreExpression('DSRead', this.storeVariableExpression, this.storenameExpression);
      result = await read.evaluate(evalcontext);
    } catch (error) {
      const create = new TSDSCreateExpression(this.storeVariableExpression, this.fieldsExpressions);
      result = await create.evaluate(evalcontext);
    }
    return result;
  }

  getExpression(): string {
    const variable = this.storeVariableExpression.getExpression();
    const storename = this.storenameExpression.getExpression();
    const fields = this.fieldsExpressions
      .map((field) => {
        return field.getExpression();
      })
      .join(',');
    return `{DSReadOrCreate~${variable},${storename},${fields}}`;
  }
}
