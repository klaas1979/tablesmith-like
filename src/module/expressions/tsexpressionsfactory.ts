import Term from './term';
import IntTerm from './intterm';
import TSExpression from './tsexpression';
import TSTextExpression from './tstextexpression';
import PlusTerm from './plusterm';
import DiceTerm from './diceterm';
import MinusTerm from './minusterm';
import TSTermExpression from './tstermexpression';
import MultTerm from './multterm';
import DivTerm from './divterm';
import BracketTerm from './bracketterm';
import GroupCallModifierTerm from './groupcallmodifierterm';
import GroupCallExpression from './groupcallexpression';
import TSNewlineExpression from './tsnewlineexpression';
import TSBoldExpression from './tsboldexpression';
import TSLineExpression from './tslineexpression';
import TSLastRollExpression from './tslastrollexpression';
type TermCreator = (a: Term, b: Term) => Term;

/**
 * Factory used by the Peggy Parser to create the in memory representaion of a Tablesmith Table file.
 */
class TSExpressionFactory {
  terms: Array<Term | undefined>;
  termCreators: Array<TermCreator | undefined>;
  groupCallModifier: GroupCallModifierTerm | undefined;
  constructor() {
    this.terms = [];
    this.termCreators = [];
  }

  /**
   * Called by parser if number has been found for a Term.
   * @param int the number that has been parsed.
   */
  addNumber(int: number): void {
    const intTerm = new IntTerm(int);
    const term = this.terms.pop();
    const termCreator = this.termCreators.pop();
    if (term && termCreator) {
      this.terms.push(termCreator(term, intTerm));
    } else {
      this.terms.push(intTerm);
    }
  }

  /**
   * Called by parser if opening bracket has been found in Math Terms.
   */
  openBracket(): void {
    this.terms.push(undefined);
    this.termCreators.push(undefined);
  }

  /**
   * Called by parser if closing bracket for math Term has been found.
   */
  closeBracket() {
    const term = this.terms.pop();
    if (term) {
      this.terms.push(new BracketTerm(term));
    } else {
      this.terms.push(undefined);
    }
  }

  /**
   * Called by parser if addtion found for a math Term.
   */
  addAddition() {
    this.termCreators.push((a: Term, b: Term): Term => {
      return new PlusTerm(a, b);
    });
  }

  /**
   * Called by parser if subtraction found for a math Term.
   */
  addSubtraction() {
    this.termCreators.push((a: Term, b: Term): Term => {
      return new MinusTerm(a, b);
    });
  }

  /**
   * Called by parser if multiplication found for a math Term.
   */
  addMultiplication() {
    this.termCreators.push((a: Term, b: Term): Term => {
      return new MultTerm(a, b);
    });
  }

  /**
   * Called by parser if division found for a math Term.
   */
  addDivision() {
    this.termCreators.push((a: Term, b: Term): Term => {
      return new DivTerm(a, b);
    });
  }

  /**
   * Called by parser if dice definition found for a math Term.
   */
  addDice() {
    this.termCreators.push((a: Term, b: Term): Term => {
      return new DiceTerm(a, b);
    });
  }

  /**
   * Creates result for math expressions when parser finds ending of Dice or Calc.
   * @returns TSExpresion for current math term.
   */
  create(): TSExpression {
    let termCreator = this.termCreators.pop();
    while (termCreator) {
      const termB = this.terms.pop();
      const termA = this.terms.pop();
      if (!termA || !termB) throw 'Cannot create TSExpression missing terms got a=${termA} b=${termB}';
      this.terms.push(termCreator(termA, termB));
      termCreator = this.termCreators.pop();
    }
    const term = this.terms.pop();
    if (!term) throw 'No term defined, cannot create!';
    const result = new TSTermExpression(term);
    return result;
  }

  /**
   * Creates a new Group Call Expression that takes a defined GroupCallModifier into account.
   * @param table to create a Group call for, may be undefined, then this table is used.
   * @param group to call.
   * @returns GroupCallExpression for provided values and posible modifier.
   */
  groupCall(table: string, group: string): GroupCallExpression {
    const modifier = this.groupCallModifier ? this.groupCallModifier : GroupCallModifierTerm.createUnmodified();
    this.groupCallModifier = undefined;
    return new GroupCallExpression(table, group, modifier);
  }

  /**
   * Prepares a group call by setting up potential modifications.
   * @param modifierType can be "=" for a fixed result or "+" / "-" for a modification of roll.
   * @param modifier to add to roll, or if fixed result the result to use.
   */
  addGroupCallModifier(modifierType: string, modifier: number): void {
    let result;
    switch (modifierType) {
      case '=':
        result = GroupCallModifierTerm.createFixedValue(new IntTerm(modifier));
        break;
      case '+':
        result = GroupCallModifierTerm.createPlus(new IntTerm(modifier));
        break;
      case '-':
        result = GroupCallModifierTerm.createMinus(new IntTerm(modifier));
        break;
      default:
        throw `Unknown modifier type '${modifierType}'`;
    }
    this.groupCallModifier = result;
  }

  /**
   * Creates a new TSExpression for given text.
   * @param text to create simple TSExpression for.
   * @returns TSTextExpression for given text.
   */
  createText(text: string): TSTextExpression {
    return new TSTextExpression(text);
  }

  /**
   * Creates a new TSExpression for bold text.
   * @param text to create bold TSExpression for.
   * @returns TSTextExpression for given text.
   */
  createBold(text: string): TSBoldExpression {
    return new TSBoldExpression(text);
  }

  /**
   * Creates a Line separator for values.
   * @param align of separator, should be "left", "center" or "right"
   * @param width in percent, int between 1-100
   * @returns TSLineExpression for given values.
   */
  createLastRoll(): TSLastRollExpression {
    return new TSLastRollExpression();
  }

  /**
   * Creates a Line separator for values.
   * @param align of separator, should be "left", "center" or "right"
   * @param width in percent, int between 1-100
   * @returns TSLineExpression for given values.
   */
  createLine(align: 'left' | 'center' | 'right', width = 100): TSLineExpression {
    return new TSLineExpression(align, width);
  }

  /**
   * Creates a new line expression.
   * @returns An expression evaluating to a new line.
   */
  createNewline(): TSExpression {
    return new TSNewlineExpression();
  }
}

export default TSExpressionFactory;
