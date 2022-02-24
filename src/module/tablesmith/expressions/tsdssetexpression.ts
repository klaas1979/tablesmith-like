import TSExpression, { BaseTSExpression } from './tsexpression';
import { SingleTSExpressionResult, TSExpressionResult } from './tsexpressionresult';
import EvaluationContext from './evaluationcontext';
import DSFieldExpression from './dsfieldexpression';
import { DSStore } from '../dsstore/dsstore';

/**
 * Class for TS-Function DSSet setting values.
 */
export default class TSDSSetExpression extends BaseTSExpression {
  private storeVariableExpression: TSExpression;
  private fieldsExpressions: DSFieldExpression[];
  private indexExpression: TSExpression;
  constructor(
    name: string,
    storeVariableExpression: TSExpression,
    fieldsExpressions: DSFieldExpression[],
    indexExpression: TSExpression,
  ) {
    super();
    this.storeVariableExpression = storeVariableExpression;
    this.fieldsExpressions = fieldsExpressions;
    this.indexExpression = indexExpression;
  }
  async evaluate(evalcontext: EvaluationContext): Promise<TSExpressionResult> {
    const variable = (await this.storeVariableExpression.evaluate(evalcontext)).asString();
    const dsStore = evalcontext.readStores.get(variable);
    if (!dsStore) throw Error(`Could not set in undefined DSStore '${variable}'`);
    const entry = await this.entryForFunction(dsStore, evalcontext);
    for (const field of this.fieldsExpressions) {
      const name = (await field.name.evaluate(evalcontext)).asString();
      const value = (await field.value.evaluate(evalcontext)).asString();
      if (!dsStore.hasField(name))
        throw Error(`Could not set field '${name}', fields ${dsStore.getFields().join(',')}`);
      Object.defineProperty(entry, name, {
        value: value,
        writable: true,
      });
    }
    return new SingleTSExpressionResult('');
  }

  private async entryForFunction(dsStore: DSStore, evalcontext: EvaluationContext): Promise<object> {
    const indexResult = await this.indexExpression?.evaluate(evalcontext);
    if (!indexResult)
      throw Error(`Cannot DSSet missing index from expression=${this.indexExpression?.getExpression()}`);
    const index = indexResult.asInt();
    const size = dsStore.size();
    if (index < 1 || index > size) throw Error(`Cannot DSSet index '${index}' out of bounds=1-${size}`);
    return dsStore.getEntry(index);
  }

  getExpression(): string {
    const variable = this.storeVariableExpression.getExpression();
    const fields = this.fieldsExpressions
      .map((field) => {
        return field.getExpression();
      })
      .join(',');
    const index = this.indexExpression.getExpression();
    return `{DSSet~${variable},${index},${fields}}`;
  }
}
