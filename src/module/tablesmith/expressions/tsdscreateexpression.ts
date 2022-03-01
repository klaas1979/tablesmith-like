import TSExpression, { BaseTSExpression } from './tsexpression';
import { SingleTSExpressionResult, TSExpressionResult } from './tsexpressionresult';
import EvaluationContext from './evaluationcontext';
import DSFieldExpression from './dsfieldexpression';
import { ObjectArrayDSStore } from '../dsstore/objectarraydsstore';

/**
 * Class for TS-Function DSCreate, creating Dataset with default values.
 */
export default class TSDSCreateExpression extends BaseTSExpression {
  private storeVariableExpression: TSExpression;
  private fieldsExpressions: DSFieldExpression[];
  constructor(storeVariableExpression: TSExpression, fieldsExpressions: DSFieldExpression[]) {
    super();
    this.storeVariableExpression = storeVariableExpression;
    this.fieldsExpressions = fieldsExpressions;
  }
  async evaluate(evalcontext: EvaluationContext): Promise<TSExpressionResult> {
    const variable = (await this.storeVariableExpression.evaluate(evalcontext)).asString();
    const dsStore = new ObjectArrayDSStore(variable);
    for (const field of this.fieldsExpressions) {
      const name = (await field.name.evaluate(evalcontext)).asString();
      const defaultvalue = (await field.value.evaluate(evalcontext)).asString();
      dsStore.addField(name, defaultvalue);
    }
    evalcontext.createDSStore(variable, dsStore);
    return new SingleTSExpressionResult('');
  }

  getExpression(): string {
    const variable = this.storeVariableExpression.getExpression();
    const fields = this.fieldsExpressions
      .map((field) => {
        return field.getExpression();
      })
      .join(',');
    return `{DSCreate~${variable},${fields}}`;
  }
}
