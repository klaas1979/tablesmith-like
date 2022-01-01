import IntTerm from './intterm';
import MinusTerm from './minusterm';
import PlusTerm from './plusterm';
import Roller from '../roller';
import Term from './term';
import TermResult from './termresult';

/**
 * A modifier for a table group call, consists of the operation "+", "-" or "="(fixed) modifier and the term
 * that represents the modifier.
 */
class GroupCallModifierTerm implements Term {
  modifierType: string;
  modifierTerm: Term;
  private constructor(modifierType: string, modifierTerm: Term) {
    this.modifierType = modifierType;
    this.modifierTerm = modifierTerm;
  }

  /**
   * Returns the Expression that represents this Modifier.
   * @returns The expression this Group call modifier translates to.
   */
  getTerm(): string {
    return `${this.modifierType}${this.modifierTerm.getTerm()}`;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  roll(roller: Roller): TermResult {
    throw 'Cannot roll this term Group Calls need runtime information about rolled upon Group to get maxValue for range';
  }

  /**
   * Modifies a Term representing the Group call to apply correct modification.
   * @param rollTerm the roll to modify.
   * @returns Term that evaluates based on given rollTerm to correct result.
   */
  modify(rollTerm: Term): Term {
    if (this.modifierType == 'unmodified') {
      return rollTerm;
    } else if (this.modifierType == '-') {
      return new MinusTerm(rollTerm, this.modifierTerm);
    } else if (this.modifierType == '+') {
      return new PlusTerm(rollTerm, this.modifierTerm);
    } else if (this.modifierType == '=') {
      return this.modifierTerm;
    }
    throw `Modfier Type '${this.modifierType}' unknown cannot create Term!`;
  }

  /**
   * Creates a modifier for subtraction.
   * @param modifierTerm to subtract from Roll.
   * @returns Minus Groupcall modifier.
   */
  static createMinus(modifierTerm: Term): GroupCallModifierTerm {
    return new GroupCallModifierTerm('-', modifierTerm);
  }

  /**
   * Creates a modifier for addition.
   * @param modifierTerm to add to Roll.
   * @returns Plus Groupcall modifier.
   */
  static createPlus(modifierTerm: Term): GroupCallModifierTerm {
    return new GroupCallModifierTerm('+', modifierTerm);
  }

  /**
   * Creates a modifier for fixed values.
   * @param fixedValueTerm to evaluate to get fixed value.
   * @returns Fixe Value Groupcall modifier.
   */
  static createFixedValue(fixedValueTerm: Term): GroupCallModifierTerm {
    return new GroupCallModifierTerm('=', fixedValueTerm);
  }

  /**
   * Creates a modifier for addition.
   * @param modifierTerm to add to Roll.
   * @returns Plus Groupcall modifier.
   */
  static createUnmodified(): GroupCallModifierTerm {
    return new GroupCallModifierTerm('unmodified', new IntTerm(0));
  }
}

export default GroupCallModifierTerm;
