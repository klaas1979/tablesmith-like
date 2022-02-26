import TSExpression, { BaseTSExpression } from './tsexpression';
import { SingleTSExpressionResult, TSExpressionResult } from './tsexpressionresult';
import EvaluationContext from './evaluationcontext';
import DSFieldCompareExpression from './dsfieldcompareexpression';

/**
 * Class for TS-Function DSFind.
 */
export default class TSDSFindExpression extends BaseTSExpression {
  private storeVariableExpression: TSExpression;
  private startIndexExpression: TSExpression;
  private fieldsExpressions: DSFieldCompareExpression[];
  constructor(
    storeVariableExpression: TSExpression,
    startIndexExpression: TSExpression,
    fieldsExpressions: DSFieldCompareExpression[],
  ) {
    super();
    this.storeVariableExpression = storeVariableExpression;
    this.startIndexExpression = startIndexExpression;
    this.fieldsExpressions = fieldsExpressions;
  }
  async evaluate(evalcontext: EvaluationContext): Promise<TSExpressionResult> {
    const variable = (await this.storeVariableExpression.evaluate(evalcontext)).asString();
    const store = evalcontext.readStores.get(variable);
    if (!store) throw Error(`No Datastore read under variable '${variable}'`);
    const start = (await this.startIndexExpression.evaluate(evalcontext)).asInt();
    let indices: number[] = [];
    for (const [currentFieldIndex, field] of this.fieldsExpressions.entries()) {
      const fieldName = (await field.name.evaluate(evalcontext)).trim();
      const compareValue = (await field.value.evaluate(evalcontext)).asString();
      const matchingIndices = store.filter(start, fieldName, field.operator, compareValue);
      if (currentFieldIndex === 0) indices = matchingIndices;
      else indices = this.reduceMatch(indices, matchingIndices);
    }
    return new SingleTSExpressionResult(indices.length > 0 ? indices[0] : -1);
  }

  private reduceMatch(match1: number[], match2: number[]): number[] {
    const reduced: number[] = [];
    for (const num of match1) {
      if (match2.includes(num)) reduced.push(num);
    }
    return reduced;
  }

  getExpression(): string {
    const variable = this.storeVariableExpression.getExpression();
    const index = this.startIndexExpression.getExpression();
    const fields = this.fieldsExpressions
      .map((field) => {
        return field.getExpression();
      })
      .join(',');
    return `{DSFind~${variable},${index},${fields}}`;
  }
}
