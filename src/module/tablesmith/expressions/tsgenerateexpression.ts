import GroupCallModifierTerm from './terms/groupcallmodifierterm';
import InnerDiceTerm from './terms/innerdiceterm';
import IntTerm from './terms/intterm';
import TSExpression, { BaseTSExpression } from './tsexpression';
import { TSExpressionResult, RerollableTSExpressionResult, SingleTSExpressionResult } from './tsexpressionresult';
import EvaluationContext from './evaluationcontext';
import { callparser } from '../parser/callparser';
import { TableCallValues } from '../../foundry/tablecallvalues';
import { tstables } from '../tstables';

/**
 * Expression to evaluate / roll on a tables group. If modifier is "=" set fixed result to true and add
 * Term defining the fixed result. If "+" or "-" are used as modifier add Term that describes the modifier
 * the modifer.
 */
export default class TSGenerateExpression extends BaseTSExpression {
  private typeExpression: TSExpression;
  private textExpression: TSExpression;
  private groupCallExpression: TSExpression;
  constructor(typeExpression: TSExpression, textExpression: TSExpression, groupCallExpression: TSExpression) {
    super();
    this.typeExpression = typeExpression;
    this.textExpression = textExpression;
    this.groupCallExpression = groupCallExpression;
  }
  async evaluate(evalcontext: EvaluationContext): Promise<TSExpressionResult> {
    const type = (await this.typeExpression.evaluate(evalcontext)).asString();
    if (type != '0') throw Error(`Type for Generate '${type}' unknown, only supports type=0`);
    let result: RerollableTSExpressionResult;
    if (!evalcontext.isGenerated(this)) {
      evalcontext.addGenerated(this);
      const text = await this.textExpression.evaluate(evalcontext);
      const textResult = new SingleTSExpressionResult(text.asString());
      result = new RerollableTSExpressionResult(evalcontext, textResult, this);
    } else result = await this.generateGroupCall(evalcontext);
    return result;
  }

  async generateGroupCall(evalcontext: EvaluationContext): Promise<RerollableTSExpressionResult> {
    const call = await this.evaluateCall(evalcontext);
    const callValues = new TableCallValues();
    callparser.parse(call, callValues);
    const table = tstables.tableForName(callValues.tablename);
    if (!table) throw Error(`Table for call '${call}' is not defined cannot evaluate!`);
    const group = table.groupForName(callValues.groupname);
    if (!group) throw Error(`Group for call '${call}' is not defined cannot evaluate!`);
    const maxValue = group.getMaxValue();
    const groupCallModifier = GroupCallModifierTerm.create(callValues.modifier, callValues.modifierValue);
    const innerDiceTerm = new InnerDiceTerm(new IntTerm(1), new IntTerm(maxValue));
    const termResult = await groupCallModifier.modify(innerDiceTerm).evaluate(evalcontext);
    const evaledParams: string[] = callValues.parameters ? callValues.parameters : [];
    evalcontext.pushCurrentCallTablename(table.name);
    table.setParametersForEvaluationByIndex(evalcontext, evaledParams);
    const result = await group.result(evalcontext, termResult.asNumber());
    evalcontext.popCurrentCallTablename();
    return new RerollableTSExpressionResult(evalcontext, result, this);
  }

  async evaluateCall(evalcontext: EvaluationContext) {
    let call = (await this.groupCallExpression.evaluate(evalcontext)).asString();
    const match = call.match(/^[^.(]+(\..+)?(\(.+\))?$/);
    call = match && (match[1] || match[2]) ? call : `${evalcontext.getCurrentCallTablename()}.${call}`;
    return '[' + call + ']';
  }

  getExpression(): string {
    const type = this.typeExpression.getExpression();
    const text = this.textExpression.getExpression();
    const groupCall = this.groupCallExpression.getExpression();
    return `{Generate~${type},${text},${groupCall}}`;
  }
}
