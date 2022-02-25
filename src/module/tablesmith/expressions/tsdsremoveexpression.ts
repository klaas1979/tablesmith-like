import TSExpression, { BaseTSExpression } from './tsexpression';
import { SingleTSExpressionResult, TSExpressionResult } from './tsexpressionresult';
import EvaluationContext from './evaluationcontext';

/**
 * Class for TS-Function DSRemove
 */
export default class TSDSRemoveExpression extends BaseTSExpression {
  private storeVariableExpression: TSExpression;
  private indexExpression: TSExpression;
  constructor(name: string, storeVariableExpression: TSExpression, indexExpression: TSExpression) {
    super();
    this.storeVariableExpression = storeVariableExpression;
    this.indexExpression = indexExpression;
  }
  async evaluate(evalcontext: EvaluationContext): Promise<TSExpressionResult> {
    const variable = (await this.storeVariableExpression.evaluate(evalcontext)).asString();
    const store = evalcontext.readStores.get(variable);
    if (!store) throw Error(`No Datastore read under variable '${variable}'`);
    const index = (await this.indexExpression.evaluate(evalcontext)).asInt();
    store.removeEntry(index);
    return new SingleTSExpressionResult('');
  }

  getExpression(): string {
    const variable = this.storeVariableExpression.getExpression();
    const index = this.indexExpression.getExpression();
    return `{DSRemove~${variable},${index}}`;
  }
}
