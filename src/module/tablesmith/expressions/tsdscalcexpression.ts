import TSExpression, { BaseTSExpression } from './tsexpression';
import { SingleTSExpressionResult, TSExpressionResult } from './tsexpressionresult';
import EvaluationContext from './evaluationcontext';

/**
 * Class for TS-Function DSCalc, getting size of Store.
 */
export default class TSDSCalcExpression extends BaseTSExpression {
  private storeVariableExpression: TSExpression;
  private operationExpression: TSExpression;
  private fieldExpression: TSExpression;
  constructor(storeVariableExpression: TSExpression, operationExpression: TSExpression, fieldExpression: TSExpression) {
    super();
    this.storeVariableExpression = storeVariableExpression;
    this.operationExpression = operationExpression;
    this.fieldExpression = fieldExpression;
  }
  async evaluate(evalcontext: EvaluationContext): Promise<TSExpressionResult> {
    const variable = (await this.storeVariableExpression.evaluate(evalcontext)).asString();
    const store = evalcontext.readStores.get(variable);
    if (!store) throw Error(`No Datastore read under variable '${variable}'`);
    const operation = (await this.operationExpression.evaluate(evalcontext)).asString();
    const field = (await this.fieldExpression.evaluate(evalcontext)).asString();
    let result = store.fieldValues(field).reduce((sum, current) => sum + Number.parseFloat(current), 0.0);
    switch (operation) {
      case 'Avg':
        if (store.size() > 0) result = result / store.size();
        break;
      case 'Sum':
        // already calculated
        break;
      default:
        throw Error(`Unknown operation for DSCalc '${operation}'`);
    }
    return new SingleTSExpressionResult(result);
  }

  getExpression(): string {
    const variable = this.storeVariableExpression.getExpression();
    const operation = this.operationExpression.getExpression();
    const field = this.fieldExpression.getExpression();
    return `{DSCalc~${variable},${operation},${field}}`;
  }
}
