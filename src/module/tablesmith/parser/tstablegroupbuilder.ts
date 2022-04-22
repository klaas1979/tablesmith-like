import TSGroup from '../tsgroup';
import TSRange from '../tsrange';
import TSExpression from '../expressions/tsexpression';
import TSIfExpression from '../expressions/tsifexpression';
import TSExpressions from '../expressions/tsexpressions';
import TSLogicalExpression from '../expressions/tslogicalexpression';
import BooleanComparison from '../expressions/booleancomparison';
import TSWhileExpression from '../expressions/tswhileexpression';
import TSLoopExpression from '../expressions/tsloopexpression';
import TSSelectExpression from '../expressions/tsselectexpression';
import SelectTuple from '../expressions/selecttuple';
import TSMathAbsExpression from '../expressions/tstmathabsexpression';
import TSMathCeilExpression from '../expressions/tstmathceilexpression';
import TSMathFloorExpression from '../expressions/tstmathfloorexpression';
import TSMathRoundExpression from '../expressions/tstmathroundexpression';
import TSMathTruncExpression from '../expressions/tstmathtruncexpression';
import TSMathMinExpression from '../expressions/tstmathminexpression';
import TSMathMaxExpression from '../expressions/tstmathmaxexpression';
import TSMathPowerExpression from '../expressions/tstmathpowerexpression';
import TSMathModExpression from '../expressions/tstmathmodexpression';
import TSMathSqrtExpression from '../expressions/tstmathsqrtexpression';
import TSIsNumberExpression from '../expressions/tsisnumberexpression';
import { TSTable } from '../tstable';
import TSGroupLockExpression from '../expressions/tsgrouplockexpression';
import TSGroupCountExpression from '../expressions/tsgroupcountexpression';
import TSGroupResetExpression from '../expressions/tsgroupresetexpression';
import Stack from './stack';
import StackItem from './stackitem';
import STACK_TYPE from './stacktype';
import TSLastRollExpression from '../expressions/tslastrollexpression';
import TSGroupRangeValueExpression from '../expressions/tsgrouprangevaluexpression';
import TSVariableSetExpression from '../expressions/tsvariablesetexpression';
import TSVariableGetExpression from '../expressions/tsvariablegetexpression';
import TSLineExpression from '../expressions/tslineexpression';
import TSNewlineExpression from '../expressions/tsnewlineexpression';
import TSGroupCallExpression from '../expressions/tsgroupcallexpression';
import GroupCallModifierTerm from '../expressions/terms/groupcallmodifierterm';
import TSParamExpression from '../expressions/tsparamexpression';
import TSDiceCalcExpression from '../expressions/terms/tsdicecalcexpression';
import PlusTerm from '../expressions/terms/plusterm';
import MinusTerm from '../expressions/terms/minusterm';
import MultTerm from '../expressions/terms/multterm';
import DivTerm from '../expressions/terms/divterm';
import InnerDiceTerm from '../expressions/terms/innerdiceterm';
import BracketTerm from '../expressions/terms/bracketterm';
import TSInputTextExpression from '../expressions/tsinputtextexpression';
import TSMsgExpression from '../expressions/tsmsgexpression';
import TSInputListExpression from '../expressions/tsinputlistexpression';
import TSGenerateExpression from '../expressions/tsgenerateexpression';
import TSDSCountExpression from '../expressions/tsdscountexpression';
import TSDSCreateExpression from '../expressions/tsdscreateexpression';
import DSFieldExpression from '../expressions/dsfieldexpression';
import TSDSGetExpression from '../expressions/tsdsgetexpression';
import TSDSStoreExpression from '../expressions/tsdsstoreexpression';
import TSDSAddExpression from '../expressions/tsdsaddexpression';
import TSDSSetExpression from '../expressions/tsdssetexpression';
import TSDSCalcExpression from '../expressions/tsdscalcexpression';
import TSDSRandomizeExpression from '../expressions/tsdsrandomizeexpression';
import TSDSRemoveExpression from '../expressions/tsdsremoveexpression';
import TSDSFindExpression from '../expressions/tsdsfindexpression';
import DSFieldCompareExpression from '../expressions/dsfieldcompareexpression';
import TSFormatExpression from '../expressions/tsformatexpression';
import TSColorExpression from '../expressions/tscolorexpression';
import TSPictureExpression from '../expressions/tspictureexpression';
import TSFindExpression from '../expressions/tsfindexpression';
import TSReplaceExpression from '../expressions/tsreplaceexpression';
import TSTextTransformExpression from '../expressions/tstexttransformexpression';
import { normalizeCase } from './tsfunctionnames';
import TSStatusExpression from '../expressions/tsstatusexpression';
import TSNoteExpression from '../expressions/tsnoteexpression';
import TSLeftRightExpression from '../expressions/tsleftrightexpression';
import TSMidExpression from '../expressions/tsmidtexpression';
import TSSplitExpression from '../expressions/tssplitexpression';
import TSDSReadOrCreateExpression from '../expressions/tsdsreadorcreateexpression';

/**
 * Group Builder is the main helper for Tablesmith parsing to hold togehter the context of a single TSGroup
 * that belongs to a table. The helper holds all needed state and stacks of contexts for parsing purpose.
 */
class TSTableGroupBuilder {
  tsTable: TSTable;
  tsGroup: TSGroup;
  range: TSRange | undefined;
  stack: Stack;
  constructor(tsTable: TSTable, group: TSGroup) {
    this.tsTable = tsTable;
    this.tsGroup = group;
    this.stack = new Stack();
  }

  /**
   * Adds a new Range to Group starting after last range or 1 if it is the first and going up to given value and
   * sets this Range up as current expressions to add to.
   * @param upper the number donating the new ranges max value.
   */
  addRange(upper: number): void {
    const newRange = this.tsGroup.addRange(upper);
    this.stack.startGroupLine(newRange.getExpressions());
  }

  /**
   * Prepares stack for a Group Call.
   * @param rerollable boolean indicating if call is rerollable or not.
   */
  startGroupCall(rerollable: boolean) {
    this.stack.startGroupCall(rerollable);
  }

  /**
   * Adds a MathTerm like +, -, *, /.
   * @param operator of the math term.
   */
  addMathTerm(operator: string): void {
    if (['+', '-'].includes(operator)) {
      this.stack.stackMathSumOperator(operator);
    } else if (['d', 'D', '*', '/'].includes(operator)) {
      this.stack.stackMathMultOperator(operator);
    }
    this.stack.stackParameter();
  }

  /**
   * Called by parser if opening bracket has been found in Math Terms.
   */
  openBracket(): void {
    this.stack.startBracket();
  }

  /**
   * Called by parser if closing bracket for math TSExpression has been found.
   */
  closeBracket() {
    this.createMathMult();
    this.createMathSum();
    const stacked = this.stack.pop();
    this.stack.pushExpressionToLast(new BracketTerm(stacked.popExpressions()));
  }

  /**
   * Called by parser if closing bracket for math TSExpression has been found.
   */
  createMathMult(): void {
    const stacked = this.stack.peek();
    while (stacked.mathMultSize() > 0) {
      const mathMultSize = stacked.mathMultSize();
      const stackSize = stacked.stackSize();
      const indexA = stackSize - (mathMultSize + 1);
      const indexB = indexA + 1;
      const operator = stacked.shiftMathMultOperator();
      const b = stacked.pullExpressionsAt(indexB);
      const a = stacked.pullExpressionsAt(indexA);
      if (!a || !b) throw Error(`Cannot create TSExpression missing terms got a=${a} b=${b}`);
      stacked.stackAt(indexA);
      stacked.pushExpressionTo(indexA, this.createTerm(operator, a, b));
    }
  }

  /**
   * Called by parser if closing bracket for math TSExpression has been found.
   */
  createMathSum(): void {
    const stacked = this.stack.peek();
    while (stacked.mathSumSize() > 0) {
      const mathSumSize = stacked.mathSumSize();
      const stackSize = stacked.stackSize();
      const indexA = stackSize - (mathSumSize + 1);
      const indexB = indexA + 1;
      const operator = stacked.shiftMathSumOperator();
      const b = stacked.pullExpressionsAt(indexB);
      const a = stacked.pullExpressionsAt(indexA);
      if (!a || !b) throw Error(`Cannot create TSExpression missing terms got a=${a} b=${b}`);
      stacked.stackAt(indexA);
      stacked.pushExpressionTo(indexA, this.createTerm(operator, a, b));
    }
  }

  private createTerm(operator: string, a: TSExpression, b: TSExpression): TSExpression {
    switch (operator) {
      case '+':
        return new PlusTerm(a, b);
      case '-':
        return new MinusTerm(a, b);
      case '*':
        return new MultTerm(a, b);
      case '/':
        return new DivTerm(a, b);
      case 'd':
      case 'D':
        return new InnerDiceTerm(a, b);
      default:
        throw Error(`Cannot add math term, unknown operator '${operator}'!`);
    }
  }

  /**
   * Prepares stack for a Variable.
   */
  startVariable(type: 'set' | 'get') {
    // the parser finds the single % and starts a new variable get, before it backtraces -> need to catch this
    if (type == 'get' && this.stack.peek().type != STACK_TYPE.VARIABLE_GET) this.stack.startVariable(type);
    else if (type == 'set') this.stack.startVariable(type);
  }

  /**
   * Starts a new function stack.
   * @param name of the function to start parsing.
   */
  startFunction(name: string): void {
    const normalized = normalizeCase(name);
    this.stack.startFunction(normalized);
  }

  /**
   * Stacks next Parameter.
   */
  stackParameter(): void {
    this.stack.stackParameter();
  }

  /**
   * Stacks String in current contex.t
   * @param value string to stack.
   */
  stackString(value: string): void {
    this.stack.stackString(value);
  }

  /**
   * Creates GroupCall from stack and its it to expressions.
   */
  createGroupCall() {
    this.addExpression(this.endGroupCall());
  }

  private endGroupCall(): TSExpression {
    const stacked = this.stack.pop();
    if (stacked.type != STACK_TYPE.GROUP_CALL)
      throw Error(`Cannot create group Call type on stack is '${stacked.type}'`);
    const params = [];
    while (stacked.stackSize() > 1) params.push(stacked.popExpressions());
    const tableAndGroup = stacked.popExpressions();
    let modifierTerm = GroupCallModifierTerm.createUnmodified();
    if (stacked.stringSize() == 1) {
      const operator = stacked.popString();
      const modifierExpression = params.pop();
      if (!modifierExpression)
        throw Error(`Cannot create group Call modifier for operator '${operator}', no Expression provided!`);
      modifierTerm = GroupCallModifierTerm.create(operator, modifierExpression);
    }
    return new TSGroupCallExpression(stacked.rerollable, tableAndGroup, modifierTerm, params.reverse());
  }

  /**
   * Creates Variable Get or Set from stack and adds it to expressions.
   */
  createVariable() {
    this.addExpression(this.endVariable());
  }

  private endVariable(): TSExpression {
    const stacked = this.stack.pop();
    let result;
    switch (stacked.type) {
      case STACK_TYPE.VARIABLE_GET:
        result = this.createVariableGet(stacked);
        break;
      case STACK_TYPE.VARIABLE_SET:
        result = this.createVariableSet(stacked);
        break;
      default:
        throw Error(`Stacked item is not a Variable Expression but '${stacked.type}'`);
    }
    return result;
  }

  private createVariableGet(stacked: StackItem): TSVariableGetExpression {
    const varNameExpression = stacked.popExpressions();
    this.checkExpressionsNotEmpty(varNameExpression);
    this.checkEmpty(stacked);
    return new TSVariableGetExpression(varNameExpression);
  }

  private createVariableSet(stacked: StackItem): TSVariableSetExpression {
    const valueExpression = stacked.popExpressions();
    const operator = stacked.popString();
    const varNameExpression = stacked.popExpressions();
    this.checkEmpty(stacked);
    return new TSVariableSetExpression(varNameExpression, operator, valueExpression);
  }

  /**
   * Creates function on top of stack and adds it to current expressions.
   */
  createFunction(): void {
    const tsfunction = this.endFunction();
    this.addExpression(tsfunction);
  }

  /**
   * Ends collecting data for a function and creates the Expression for the function.
   * @returns TSExpression for the function on top of stack.
   */
  private endFunction(): TSExpression {
    const stacked = this.stack.pop();
    if (stacked.type != STACK_TYPE.FUNCTION) throw Error(`Stacked item is not a function but '${stacked.type}'`);
    let result;
    switch (stacked.name) {
      case 'Abs':
        result = new TSMathAbsExpression(stacked.popExpressions());
        break;
      case 'And':
        result = this.createLogicalExpression(stacked);
        break;
      case 'Bold':
      case 'Italic':
        result = this.createFormatExpression(stacked);
        break;
      case 'Calc':
      case 'Dice':
        result = new TSDiceCalcExpression(stacked.name, stacked.popExpressions());
        break;
      case 'AorAn':
      case 'Cap':
      case 'CapEachWord':
      case 'LCase':
      case 'Length':
      case 'UCase':
      case 'Trim':
      case 'VowelStart':
        result = new TSTextTransformExpression(stacked.name, stacked.popExpressions());
        break;
      case 'Count':
        result = this.createCountExpression(stacked);
        break;
      case 'Ceil':
        result = new TSMathCeilExpression(stacked.popExpressions());
        break;
      case 'CR':
        stacked.popExpressions();
        result = new TSNewlineExpression();
        break;
      case 'Color':
        result = this.createColorExpression(stacked);
        break;
      case 'DSCount':
        result = new TSDSCountExpression(stacked.popExpressions());
        break;
      case 'DSAdd':
      case 'DSAddNR':
        result = this.createDSAddExpression(stacked);
        break;
      case 'DSCalc':
        result = this.createDSCalcExpression(stacked);
        break;
      case 'DSCreate':
        result = this.createDSCreateExpression(stacked);
        break;
      case 'DSFind':
        result = this.createDSFindExpression(stacked);
        break;
      case 'DSGet':
        result = this.createDSGetExpression(stacked);
        break;
      case 'DSSet':
        result = this.createDSSetExpression(stacked);
        break;
      case 'DSRandomize':
        result = new TSDSRandomizeExpression(stacked.popExpressions());
        break;
      case 'DSRemove':
        result = this.createDSRemoveExpression(stacked);
        break;
      case 'DSRead':
      case 'DSWrite':
        result = this.createDSStoreExpression(stacked);
        break;
      case 'DSReadOrCreate':
        result = this.createDSReadOrCreateExpression(stacked);
        break;
      case 'Floor':
        result = new TSMathFloorExpression(stacked.popExpressions());
        break;
      case 'Find':
        result = this.createFindExpression(stacked);
        break;
      case 'Generate':
        result = this.createGenerateExpression(stacked);
        break;
      case 'InputList':
        result = this.createInputListExpression(stacked);
        break;
      case 'InputText':
        result = this.createInputTextExpression(stacked);
        break;
      case 'IsNumber':
        result = this.createIsNumberExpression(stacked);
        break;
      case 'If':
      case 'IIf':
        result = this.createIfExpression(stacked);
        break;
      case 'LastRoll':
        result = this.createLastRollExpression(stacked);
        break;
      case 'Char':
      case 'Left':
      case 'Right':
        result = this.createLeftRightExpression(stacked);
        break;
      case 'Line':
        result = this.createLineExpression(stacked);
        break;
      case 'Lockout':
        result = this.createGroupLockExpression(stacked);
        break;
      case 'Loop':
        result = this.createLoopExpression(stacked);
        break;
      case 'Min':
        result = this.createMathMinMax(stacked);
        break;
      case 'MinVal':
        result = this.createGroupRangeValueExpression(stacked);
        break;
      case 'Max':
        result = this.createMathMinMax(stacked);
        break;
      case 'MaxVal':
        result = this.createGroupRangeValueExpression(stacked);
        break;
      case 'Mid':
        result = this.createMidExpression(stacked);
        break;
      case 'Mod':
        result = this.createMathMod(stacked);
        break;
      case 'Msg':
        result = this.createMsgExpression(stacked);
        break;
      case 'Note':
        result = this.createNoteExpression(stacked);
        break;
      case 'Or':
        result = this.createLogicalExpression(stacked);
        break;
      case 'CommaReplace':
      case 'Replace':
        result = this.createReplaceExpression(stacked);
        break;
      case 'Reset':
        result = this.createResetExpression(stacked);
        break;
      case 'Param':
        result = this.createParamExpression(stacked);
        break;
      case 'Picture':
        result = new TSPictureExpression(stacked.popExpressions());
        break;
      case 'Power':
        result = this.createMathPower(stacked);
        break;
      case 'Round':
        result = this.createMathRound(stacked);
        break;
      case 'Trunc':
        result = new TSMathTruncExpression(stacked.popExpressions());
        break;
      case 'Select':
        result = this.createSelectExpression(stacked);
        break;
      case 'Split':
        result = this.createSplitExpression(stacked);
        break;
      case 'Sqrt':
        result = new TSMathSqrtExpression(stacked.popExpressions());
        break;
      case 'Status':
        result = new TSStatusExpression(stacked.popExpressions());
        break;
      case 'Unlock':
        result = this.createGroupLockExpression(stacked);
        break;
      case 'While':
        result = this.createWhileExpression(stacked);
        break;
      case 'Xor':
        result = this.createLogicalExpression(stacked);
        break;
      default:
        throw Error(`Expression Factory for function '${stacked.name}' not defined!`);
    }
    this.checkEmpty(stacked);
    return result;
  }

  private createFormatExpression(data: StackItem): TSFormatExpression {
    const result = data.popExpressions();
    return new TSFormatExpression(data.name, result);
  }

  private createColorExpression(data: StackItem): TSColorExpression {
    const text = data.popExpressions();
    const color = data.popExpressions();
    return new TSColorExpression(color, text);
  }

  private createCountExpression(data: StackItem): TSGroupCountExpression {
    const expression = data.popExpressions();
    return new TSGroupCountExpression(this.tsTable.name, expression);
  }

  private createDSAddExpression(data: StackItem): TSDSAddExpression {
    if (data.stackSize() % 2 === 0) throw Error(`Missing values for DSAdd, if key provided value must be given`);
    const fields: DSFieldExpression[] = [];
    while (data.stackSize() > 1) {
      const value = data.popExpressions();
      const field = data.popExpressions();
      fields.push(new DSFieldExpression(field, value));
    }
    const storeVariableExpression = data.popExpressions();
    return new TSDSAddExpression(data.name, storeVariableExpression, fields.reverse());
  }

  private createDSCalcExpression(data: StackItem): TSDSCalcExpression {
    const fieldExpression = data.popExpressions();
    const operationExpression = data.popExpressions();
    const storeVariableExpression = data.popExpressions();
    return new TSDSCalcExpression(storeVariableExpression, operationExpression, fieldExpression);
  }

  private createDSSetExpression(data: StackItem): TSDSSetExpression {
    if (data.stackSize() % 2 === 1) throw Error(`Missing values for DSSet, if key provided value must be given`);
    const fields: DSFieldExpression[] = [];
    while (data.stackSize() > 2) {
      const value = data.popExpressions();
      const field = data.popExpressions();
      fields.push(new DSFieldExpression(field, value));
    }
    const indexExpression = data.popExpressions();
    const storeVariableExpression = data.popExpressions();
    return new TSDSSetExpression(data.name, storeVariableExpression, fields.reverse(), indexExpression);
  }

  private createDSReadOrCreateExpression(data: StackItem): TSDSReadOrCreateExpression {
    if (data.stackSize() % 2 === 1) throw Error(`Missing default values for DSReadOrCreate!`);
    const fields: DSFieldExpression[] = [];
    while (data.stackSize() > 2) {
      const defaultvalue = data.popExpressions();
      const field = data.popExpressions();
      fields.push(new DSFieldExpression(field, defaultvalue));
    }
    const storenameExpression = data.popExpressions();
    const storeVariableExpression = data.popExpressions();
    return new TSDSReadOrCreateExpression(storeVariableExpression, storenameExpression, fields.reverse());
  }

  private createDSCreateExpression(data: StackItem): TSDSCreateExpression {
    if (data.stackSize() % 2 === 0) throw Error(`Missing default values for DSCreate!`);
    const fields: DSFieldExpression[] = [];
    while (data.stackSize() > 1) {
      const defaultvalue = data.popExpressions();
      const field = data.popExpressions();
      fields.push(new DSFieldExpression(field, defaultvalue));
    }
    const storeVariableExpression = data.popExpressions();
    return new TSDSCreateExpression(storeVariableExpression, fields.reverse());
  }

  private createDSFindExpression(data: StackItem): TSDSFindExpression {
    if (data.stackSize() < 3) throw Error(`Missing finder expressions for DSFind!`);
    const fields: DSFieldCompareExpression[] = [];
    while (data.stackSize() > 2) {
      const defaultvalue = data.popExpressions();
      const operator = data.popString();
      const field = data.popExpressions();
      fields.push(new DSFieldCompareExpression(field, operator, defaultvalue));
    }
    const startIndexExpression = data.popExpressions();
    const storeVariableExpression = data.popExpressions();
    return new TSDSFindExpression(storeVariableExpression, startIndexExpression, fields.reverse());
  }

  private createDSGetExpression(data: StackItem): TSDSGetExpression {
    const fieldNameExpression = data.popExpressions();
    const indexExpression = data.popExpressions();
    const storeVariableExpression = data.popExpressions();
    return new TSDSGetExpression(storeVariableExpression, indexExpression, fieldNameExpression);
  }

  private createDSRemoveExpression(data: StackItem): TSDSRemoveExpression {
    const indexExpression = data.popExpressions();
    const storeVariableExpression = data.popExpressions();
    return new TSDSRemoveExpression(data.name, storeVariableExpression, indexExpression);
  }

  private createDSStoreExpression(data: StackItem): TSDSStoreExpression {
    const storenameExpression = data.popExpressions();
    const storeVariableExpression = data.popExpressions();
    return new TSDSStoreExpression(data.name, storeVariableExpression, storenameExpression);
  }

  private createFindExpression(data: StackItem): TSFindExpression {
    const textExpression = data.popExpressions();
    const searchExpression = data.popExpressions();
    const indexExpression = data.popExpressions();
    return new TSFindExpression(indexExpression, searchExpression, textExpression);
  }

  private createGenerateExpression(data: StackItem): TSGenerateExpression {
    const groupCallExpression = data.popExpressions();
    const textExpression = data.popExpressions();
    const typeExpression = data.popExpressions();
    return new TSGenerateExpression(typeExpression, textExpression, groupCallExpression);
  }

  private createIfExpression(data: StackItem): TSIfExpression {
    const falseVal = data.stackSize() == 4 ? data.popExpressions() : new TSExpressions();
    const trueVal = data.popExpressions();
    const ifExpression2 = data.popExpressions();
    const ifExpression1 = data.popExpressions();
    const operator = data.popString();
    const booleanComparision = new BooleanComparison(ifExpression1, operator, ifExpression2);
    return new TSIfExpression(data.name, booleanComparision, trueVal, falseVal);
  }

  private createInputListExpression(data: StackItem): TSInputListExpression {
    const options = [];
    if (data.stackSize() < 3) throw Error('Cannot create InputList missing Parameters!');
    while (data.stackSize() > 2) {
      const option = data.popExpressions();
      options.push(option);
    }
    options.reverse();
    const promptExpression = data.popExpressions();
    const defaultValueExpression = data.popExpressions();
    return new TSInputListExpression(defaultValueExpression, promptExpression, options);
  }

  private createInputTextExpression(data: StackItem): TSInputTextExpression {
    const prompt = data.popExpressions();
    const defaultValue = data.popExpressions();
    return new TSInputTextExpression(defaultValue, prompt);
  }

  private createNoteExpression(data: StackItem): TSNoteExpression {
    const text = data.popExpressions();
    return new TSNoteExpression(text);
  }

  private createIsNumberExpression(data: StackItem): TSIsNumberExpression {
    const expression = data.popExpressions();
    return new TSIsNumberExpression(expression);
  }

  private createMsgExpression(data: StackItem): TSMsgExpression {
    const expression = data.popExpressions();
    return new TSMsgExpression(expression);
  }

  private createLastRollExpression(data: StackItem): TSLastRollExpression {
    data.popExpressions();
    return new TSLastRollExpression();
  }

  private createLeftRightExpression(data: StackItem): TSLeftRightExpression {
    const text = data.popExpressions();
    const number = data.popExpressions();
    return new TSLeftRightExpression(data.name, number, text);
  }

  private createMidExpression(data: StackItem): TSMidExpression {
    const text = data.popExpressions();
    const start = data.popExpressions();
    const length = data.popExpressions();
    return new TSMidExpression(length, start, text);
  }

  private createLineExpression(data: StackItem): TSLineExpression {
    const width = data.popExpressions();
    const align = data.popExpressions();
    return new TSLineExpression(align, width);
  }

  private createLogicalExpression(data: StackItem): TSLogicalExpression {
    const comparisons: BooleanComparison[] = [];
    while (data.stackSize() > 0) {
      const ifExpression2 = data.popExpressions();
      const ifExpression1 = data.popExpressions();
      const operator = data.popString();
      const comparison = new BooleanComparison(ifExpression1, operator, ifExpression2);
      comparisons.push(comparison);
    }
    comparisons.reverse();
    return new TSLogicalExpression(data.name, comparisons);
  }

  private createLoopExpression(data: StackItem): TSLoopExpression {
    const block = data.popExpressions();
    const counterExpression = data.popExpressions();
    return new TSLoopExpression(counterExpression, block);
  }

  private createGroupLockExpression(data: StackItem): TSGroupLockExpression {
    const parameters = [];
    if (data.stackSize() < 2) throw Error('Cannot create Lockout missing parameters!');
    while (data.stackSize() > 1) {
      const param = data.popExpressions();
      parameters.push(param);
    }
    parameters.reverse();
    const groupExpression = data.popExpressions();
    return new TSGroupLockExpression(data.name, this.tsTable.getName(), groupExpression, parameters);
  }

  private createGroupRangeValueExpression(data: StackItem): TSGroupRangeValueExpression {
    const param = data.popExpressions();
    const groupExpression = data.popExpressions();
    return new TSGroupRangeValueExpression(data.name, this.tsTable.getName(), groupExpression, param);
  }

  private createMathMinMax(data: StackItem): TSMathMinExpression | TSMathMaxExpression {
    const values: TSExpression[] = [];
    while (data.stackSize() > 0) {
      values.push(data.popExpressions());
    }
    values.reverse();
    let result;
    switch (data.name) {
      case 'Min':
        result = new TSMathMinExpression(values);
        break;
      case 'Max':
        result = new TSMathMaxExpression(values);
        break;
      default:
        throw Error(`Cannot create math Min or Max unknown function name '${data.name}'`);
    }
    return result;
  }

  private createMathMod(data: StackItem): TSMathModExpression {
    const divisor = data.popExpressions();
    const param = data.popExpressions();
    return new TSMathModExpression(param, divisor);
  }

  private createMathRound(data: StackItem): TSMathRoundExpression {
    const param = data.popExpressions();
    const places = data.popExpressions();
    return new TSMathRoundExpression(param, places);
  }

  private createMathPower(data: StackItem): TSMathPowerExpression {
    const power = data.popExpressions();
    const param = data.popExpressions();
    return new TSMathPowerExpression(param, power);
  }

  private createParamExpression(data: StackItem): TSParamExpression {
    const index = data.popExpressions();
    const variable = data.popExpressions();
    return new TSParamExpression(variable, index, this.tsTable.parameters);
  }

  private createReplaceExpression(data: StackItem): TSReplaceExpression {
    const textExpression = data.popExpressions();
    const replaceExpression = data.popExpressions();
    const searchExpression = data.popExpressions();
    return new TSReplaceExpression(data.name, searchExpression, replaceExpression, textExpression);
  }

  private createResetExpression(data: StackItem): TSGroupResetExpression {
    const expression = data.popExpressions();
    return new TSGroupResetExpression(this.tsTable.name, expression);
  }

  createSelectExpression(data: StackItem): TSSelectExpression {
    // 1 depth for select + 2 for each key/value pair + 1 if default -> default is even
    let defaultValue = new TSExpressions();
    if (data.stackSize() % 2 == 0) {
      defaultValue = data.popExpressions();
    }
    const tuples: SelectTuple[] = [];
    while (data.stackSize() > 2) {
      const value = data.popExpressions();
      const key = data.popExpressions();
      tuples.push(new SelectTuple(key, value));
    }
    tuples.reverse();
    const selector = data.popExpressions();
    return new TSSelectExpression(selector, tuples, defaultValue);
  }

  private createSplitExpression(data: StackItem): TSSplitExpression {
    const vars = [];
    if (data.stackSize() < 3) throw Error('Cannot create Split missing Parameters!');
    while (data.stackSize() > 2) {
      const variable = data.popExpressions();
      vars.push(variable);
    }
    vars.reverse();
    const separatorExpression = data.popExpressions();
    const splitVariableExpressoin = data.popExpressions();
    return new TSSplitExpression(splitVariableExpressoin, separatorExpression, vars);
  }

  private createWhileExpression(data: StackItem): TSWhileExpression {
    const block = data.popExpressions();
    let checkExpression: TSExpression;
    // number of stacked states can be 2 for a boolean comparison or 1 for a TS Expressions evaluated without comparison
    if (data.stackSize() == 2) {
      const ifExpression2 = data.popExpressions();
      const ifExpression1 = data.popExpressions();
      const operator = data.popString();
      checkExpression = new BooleanComparison(ifExpression1, operator, ifExpression2);
    } else {
      checkExpression = data.popExpressions();
    }
    return new TSWhileExpression(checkExpression, block);
  }

  /**
   * Checks if given expressions contain any data, if not throws exception.
   * @param expressions to check to contain any data.
   */
  private checkExpressionsNotEmpty(expressions: TSExpressions) {
    if (expressions.size() == 0) throw Error(`Expressions empty, but should not!`);
  }

  /**
   * Checks if all parsed data was used, if not throws exception.
   * @param data to check that it is empty meaning that no unused data was parsed.
   */
  private checkEmpty(data: StackItem) {
    if (!data.isEmpty())
      throw Error(`Expression data for ${data.name} retrieved, still data left: '${data.summary()}'`);
  }

  /**
   * Adds expression to currently setup expressions, that can be a Range or a before or after part.
   * @param expression to add to this group.
   */
  addExpression(expression: TSExpression): void {
    expression.setGroup(this.tsGroup);
    this.stack.pushExpressionToLast(expression);
  }

  /**
   * Helper setting up the current expressions to add to the before expressions of the group.
   */
  addBefore(): void {
    this.stack.startGroupLine(this.tsGroup.before);
  }

  /**
   * Helper setting up the current expressions to add to the after expressions of the group.
   */
  addAfter(): void {
    this.stack.startGroupLine(this.tsGroup.after);
  }

  /**
   * Sets the operator used in boolean comparison.
   * @param operator to set for comparison.
   */
  setBooleanComparisonOperator(operator: string) {
    this.stack.stackParameter();
    this.stack.stackString(operator);
  }
}

export default TSTableGroupBuilder;
