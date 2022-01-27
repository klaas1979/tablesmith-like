import MinusTerm from './minusterm';
import PlusTerm from './plusterm';
import { MODIFIERS } from '../../../foundry/tablecallvalues';
import TSExpression from '../tsexpression';
import TSTextExpression from '../tstextexpression';
import TSExpressionResult from '../tsexpressionresult';
import TSGroup from '../../tsgroup';

/**
 * A modifier for a table group call, consists of the operation "+", "-" or "="(fixed) modifier and the term
 * that represents the modifier.
 */
class GroupCallModifierTerm implements TSExpression {
  modifierType: MODIFIERS;
  modifierTerm: TSExpression;
  private constructor(modifierType: MODIFIERS, modifierExpression: TSExpression) {
    this.modifierType = modifierType;
    this.modifierTerm = modifierExpression;
  }

  /**
   * Returns the Expression that represents this Modifier.
   * @returns The expression this Group call modifier translates to.
   */
  getExpression(): string {
    if (this.modifierType == MODIFIERS.none) return '';
    return `${this.modifierType}${this.modifierTerm.getExpression()}`;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  evaluate(): TSExpressionResult {
    throw 'Cannot roll this term Group Calls need runtime information about rolled upon Group to get maxValue for range';
  }

  /**
   * Modifies a TSExpression representing the Group call to apply correct modification.
   * @param rollTerm the roll to modify.
   * @returns Term that evaluates based on given rollTerm to correct result.
   */
  modify(rollTerm: TSExpression): TSExpression {
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
   * @param modifierExpression the number to modify with.
   * @returns GroupCallModifierTerm to modify rolls with.
   */
  static create(modifierType: string, modifierExpression: TSExpression | number): GroupCallModifierTerm {
    if (typeof modifierExpression == 'number') modifierExpression = new TSTextExpression(`${modifierExpression}`);
    let result;
    switch (modifierType) {
      case MODIFIERS.none:
        result = GroupCallModifierTerm.createUnmodified();
        break;
      case MODIFIERS.equal:
        result = GroupCallModifierTerm.createFixedValue(modifierExpression);
        break;
      case MODIFIERS.plus:
        result = GroupCallModifierTerm.createPlus(modifierExpression);
        break;
      case MODIFIERS.minus:
        result = GroupCallModifierTerm.createMinus(modifierExpression);
        break;
      default:
        throw `Unknown modifier type '${modifierType}'`;
    }
    return result;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setGroup(group: TSGroup): void {
    // empty nothing must be set for this expression
  }

  /**
   * Creates a modifier for subtraction.
   * @param modifierExpression to subtract from Roll.
   * @returns Minus Groupcall modifier.
   */
  static createMinus(modifierExpression: TSExpression): GroupCallModifierTerm {
    return new GroupCallModifierTerm(MODIFIERS.minus, modifierExpression);
  }

  /**
   * Creates a modifier for addition.
   * @param modifierExpression to add to Roll.
   * @returns Plus Groupcall modifier.
   */
  static createPlus(modifierExpression: TSExpression): GroupCallModifierTerm {
    return new GroupCallModifierTerm(MODIFIERS.plus, modifierExpression);
  }

  /**
   * Creates a modifier for fixed values.
   * @param modifierExpression to evaluate to get fixed value.
   * @returns Fixe Value Groupcall modifier.
   */
  static createFixedValue(modifierExpression: TSExpression): GroupCallModifierTerm {
    return new GroupCallModifierTerm(MODIFIERS.equal, modifierExpression);
  }

  /**
   * Creates a modifier for unmodified roles.
   * @returns Modifier to leave roll as is.
   */
  static createUnmodified(): GroupCallModifierTerm {
    return new GroupCallModifierTerm(MODIFIERS.none, new TSTextExpression('0'));
  }
}

export default GroupCallModifierTerm;
