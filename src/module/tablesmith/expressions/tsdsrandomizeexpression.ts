import TSExpression, { BaseTSExpression } from './tsexpression';
import { SingleTSExpressionResult, TSExpressionResult } from './tsexpressionresult';
import EvaluationContext from './evaluationcontext';

/**
 * Class for TS-Function DSRandomize
 */
export default class TSDSRandomizeExpression extends BaseTSExpression {
  private storeVariableExpression: TSExpression;
  constructor(storeVariableExpression: TSExpression) {
    super();
    this.storeVariableExpression = storeVariableExpression;
  }
  async evaluate(evalcontext: EvaluationContext): Promise<TSExpressionResult> {
    const variable = (await this.storeVariableExpression.evaluate(evalcontext)).asString();
    const store = evalcontext.readStores.get(variable);
    if (!store) throw Error(`No Datastore read under variable '${variable}'`);
    store.shuffle();
    return new SingleTSExpressionResult('');
  }

  getExpression(): string {
    const variable = this.storeVariableExpression.getExpression();
    return `{DSRandomize~${variable}}`;
  }
}
