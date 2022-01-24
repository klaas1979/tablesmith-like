import IntTerm from './intterm';
import MinusTerm from './minusterm';
import PlusTerm from './plusterm';
import Evalcontext from '../evaluationcontext';
import Term from './term';
import TermResult from './termresult';
import { MODIFIERS } from '../../../foundry/tablecallvalues';

/**
 * A modifier for a table group call, consists of the operation "+", "-" or "="(fixed) modifier and the term
 * that represents the modifier.
 */
class GroupCallModifierTerm implements Term {
  modifierType: MODIFIERS;
  modifierTerm: Term;
  private constructor(modifierType: MODIFIERS, modifierTerm: Term) {
    this.modifierType = modifierType;
    this.modifierTerm = modifierTerm;
  }

  /**
   * Returns the Expression that represents this Modifier.
   * @returns The expression this Group call modifier translates to.
   */
  getTerm(): string {
    if (this.modifierType == MODIFIERS.none) return '';
    return `${this.modifierType}${this.modifierTerm.getTerm()}`;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  roll(evalcontext: Evalcontext): TermResult {
    throw 'Cannot roll this term Group Calls need runtime information about rolled upon Group to get maxValue for range';
  }

  /**
   * Modifies a Term representing the Group call to apply correct modification.
   * @param rollTerm the roll to modify.
   * @returns Term that evaluates based on given rollTerm to correct result.
   */
  modify(rollTerm: Term): Term {
    if (this.modifierType == MODIFIERS.none) {
      return rollTerm;
    } else if (this.modifierType == MODIFIERS.minus) {
      return new MinusTerm(rollTerm, this.modifierTerm);
    } else if (this.modifierType == MODIFIERS.plus) {
      return new PlusTerm(rollTerm, this.modifierTerm);
    } else if (this.modifierType == MODIFIERS.equal) {
      return this.modifierTerm;
    }
    throw `Modfier Type '${this.modifierType}' unknown cannot create Term!`;
  }

  /**
   * Creates a new modifier for given values.
   * @param modifierType to create for can be '=', '-' or '+' for changes or 'unmodified'.
   * @param modifier the number to modify with.
   * @returns GroupCallModifierTerm to modify rolls with.
   */
  static create(modifierType: string, modifier: number): GroupCallModifierTerm {
    let result;
    switch (modifierType) {
      case MODIFIERS.none:
        result = GroupCallModifierTerm.createUnmodified();
        break;
      case MODIFIERS.equal:
        result = GroupCallModifierTerm.createFixedValue(new IntTerm(modifier));
        break;
      case MODIFIERS.plus:
        result = GroupCallModifierTerm.createPlus(new IntTerm(modifier));
        break;
      case MODIFIERS.minus:
        result = GroupCallModifierTerm.createMinus(new IntTerm(modifier));
        break;
      default:
        throw `Unknown modifier type '${modifierType}'`;
    }
    return result;
  }

  /**
   * Creates a modifier for subtraction.
   * @param modifierTerm to subtract from Roll.
   * @returns Minus Groupcall modifier.
   */
  static createMinus(modifierTerm: Term): GroupCallModifierTerm {
    return new GroupCallModifierTerm(MODIFIERS.minus, modifierTerm);
  }

  /**
   * Creates a modifier for addition.
   * @param modifierTerm to add to Roll.
   * @returns Plus Groupcall modifier.
   */
  static createPlus(modifierTerm: Term): GroupCallModifierTerm {
    return new GroupCallModifierTerm(MODIFIERS.plus, modifierTerm);
  }

  /**
   * Creates a modifier for fixed values.
   * @param fixedValueTerm to evaluate to get fixed value.
   * @returns Fixe Value Groupcall modifier.
   */
  static createFixedValue(fixedValueTerm: Term): GroupCallModifierTerm {
    return new GroupCallModifierTerm(MODIFIERS.equal, fixedValueTerm);
  }

  /**
   * Creates a modifier for unmodified roles.
   * @returns Modifier to leave roll as is.
   */
  static createUnmodified(): GroupCallModifierTerm {
    return new GroupCallModifierTerm(MODIFIERS.none, new IntTerm(0));
  }
}

export default GroupCallModifierTerm;
