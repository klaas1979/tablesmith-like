import TSExpression, { BaseTSExpression } from './tsexpression';
import { SingleTSExpressionResult, TSExpressionResult } from './tsexpressionresult';
import EvaluationContext from './evaluationcontext';
import DSFieldExpression from './dsfieldexpression';

/**
 * Class for TS-Function DSCreate, creating Dataset with default values.
 */
export default class TSDSAddExpression extends BaseTSExpression {
  private name: string;
  private storeVariableExpression: TSExpression;
  private fieldsExpressions: DSFieldExpression[];
  constructor(name: string, storeVariableExpression: TSExpression, fieldsExpressions: DSFieldExpression[]) {
    super();
    this.name = name;
    this.storeVariableExpression = storeVariableExpression;
    this.fieldsExpressions = fieldsExpressions;
  }
  async evaluate(evalcontext: EvaluationContext): Promise<TSExpressionResult> {
    const variable = (await this.storeVariableExpression.evaluate(evalcontext)).asString();
    const dsStore = evalcontext.readStores.get(variable);
    if (!dsStore) throw Error(`Could not add to undefined DSStore '${variable}'`);
    const entry = dsStore.createEntry();
    for (const field of this.fieldsExpressions) {
      const name = (await field.name.evaluate(evalcontext)).asString();
      const value = (await field.value.evaluate(evalcontext)).asString();
      Object.defineProperty(entry, name, {
        value: value,
        writable: true,
      });
    }
    const result = this.name === 'DSAdd' ? dsStore.size() : '';
    return new SingleTSExpressionResult(result);
  }

  getExpression(): string {
    const variable = this.storeVariableExpression.getExpression();
    const fields = this.fieldsExpressions
      .map((field) => {
        return field.getExpression();
      })
      .join(',');
    return `{${this.name}~${variable},${fields}}`;
  }
}
