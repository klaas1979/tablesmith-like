import TSExpression, { BaseTSExpression } from './tsexpression';
import { SingleTSExpressionResult, TSExpressionResult } from './tsexpressionresult';
import EvaluationContext from './evaluationcontext';

/**
 * Class for TS-Function DSGet, to retrieve single fields from a Dataset.
 */
export default class TSDSGetExpression extends BaseTSExpression {
  private storeVariableExpression: TSExpression;
  private indexExpression: TSExpression;
  private fieldNameExpression: TSExpression;
  constructor(storeVariableExpression: TSExpression, indexExpression: TSExpression, fieldNameExpression: TSExpression) {
    super();
    this.storeVariableExpression = storeVariableExpression;
    this.indexExpression = indexExpression;
    this.fieldNameExpression = fieldNameExpression;
  }
  async evaluate(evalcontext: EvaluationContext): Promise<TSExpressionResult> {
    const variable = (await this.storeVariableExpression.evaluate(evalcontext)).asString();
    const index = (await this.indexExpression.evaluate(evalcontext)).asInt();
    const fieldName = (await this.fieldNameExpression.evaluate(evalcontext)).asString();
    const result = evalcontext.getDSStoreEntryField(variable, index, fieldName);
    return new SingleTSExpressionResult(result);
  }

  getExpression(): string {
    const variable = this.storeVariableExpression.getExpression();
    const index = this.indexExpression.getExpression();
    const fieldName = this.fieldNameExpression.getExpression();
    return `{DSGet~${variable},${index},${fieldName}}`;
  }
}
