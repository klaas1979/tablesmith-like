import TSExpression, { BaseTSExpression } from './tsexpression';
import { SingleTSExpressionResult, TSExpressionResult } from './tsexpressionresult';
import EvaluationContext from './evaluationcontext';

/**
 * Class for TS-Function DSRead and DSWrite, loading a store from backend.
 */
export default class TSDSStoreExpression extends BaseTSExpression {
  private name: string;
  private storeVariableExpression: TSExpression;
  private storenameExpression: TSExpression;
  constructor(name: string, storeVariableExpression: TSExpression, storenameExpression: TSExpression) {
    super();
    this.name = name;
    this.storeVariableExpression = storeVariableExpression;
    this.storenameExpression = storenameExpression;
  }
  async evaluate(evalcontext: EvaluationContext): Promise<TSExpressionResult> {
    const variable = (await this.storeVariableExpression.evaluate(evalcontext)).asString();
    const storename = (await this.storenameExpression.evaluate(evalcontext)).asString();
    switch (this.name) {
      case 'DSRead':
        await evalcontext.readDSStore(variable, storename);
        break;
      case 'DSWrite':
        await evalcontext.writeDSStore(variable, storename);
        break;
      default:
        throw Error(`Unknown DSStore expression '${this.name}'`);
    }
    return new SingleTSExpressionResult('');
  }

  getExpression(): string {
    const variable = this.storeVariableExpression.getExpression();
    const storename = this.storenameExpression.getExpression();
    return `{${this.name}~${variable},${storename}}`;
  }
}
