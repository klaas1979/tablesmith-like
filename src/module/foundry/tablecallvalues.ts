import TSGroup from '../tablesmith/tsgroup';
import { TSTable } from '../tablesmith/tstable';
import { Logger } from './logger';

/**
 * Managed object of this form with all data.
 */
export const enum MODIFIERS {
  plus = '+',
  minus = '-',
  equal = '=',
  none = 'none',
}
export class TableCallValues {
  table: TSTable | undefined;
  group: TSGroup | undefined;
  tablename: string;
  groupname: string;
  modifier: MODIFIERS;
  modifierValue: number;
  parameters: string[] | undefined;
  rollCount: number;
  constructor() {
    this.tablename = '';
    this.groupname = 'Start';
    this.modifier = MODIFIERS.none;
    this.modifierValue = 0;
    this.parameters = [];
    this.rollCount = 1;
  }

  /**
   * Checks if table has parameters and if all params are provided by call, if not returns true.
   * @returns boolean true if table needs parameters set otherwise false.
   */
  needsParameters(): boolean {
    let result = false;
    if (this.table) {
      const numParams = this.table.parameters.length;
      result = (numParams > 0 && this.parameters == null) || numParams != this.parameters?.length;
    }
    Logger.debug(false, 'needsParameters', result);
    return result;
  }

  /**
   * Creates a Tablesmith call expression in format:
   * '['[tablename].[groupname]([modifier][modifiervalue])?(param1,..,param-n)?']:rollCount'
   * @returns Expression for Tablesmith evaluate.
   */
  createExpression(): string {
    let mod = '';
    let params = '';
    let count = '';
    if (this.modifier != MODIFIERS.none) mod = `${this.modifier}${this.modifierValue}`;
    if (this.parameters && this.parameters.length > 0) params = `(${this.parameters.join(',')})`;
    if (this.rollCount && this.rollCount > 1) count = `:${this.rollCount}`;
    return `[${this.tablename}.${this.groupname}${mod}${params}]${count}`;
  }
}
