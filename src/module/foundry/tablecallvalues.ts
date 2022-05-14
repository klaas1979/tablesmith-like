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
      if (numParams > 0) {
        result = this.parameters == null || this.parameters?.length !== numParams;
      }
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
    this.updateNames();
    let mod = '';
    let params = '';
    let count = '';
    if (this.modifier != MODIFIERS.none) mod = `${this.modifier}${this.modifierValue}`;
    if (this.parameters && this.parameters.length > 0) params = `(${this.parameters.join(',')})`;
    if (this.rollCount && this.rollCount > 1) count = `:${this.rollCount}`;
    return `[${this.tablename}.${this.groupname}${mod}${params}]${count}`;
  }

  /**
   * Updates Table and group name from set Table and group object, if objects are not set leaves
   * text values as is.
   */
  updateNames(): void {
    this.tablename = this.table ? this.table.name : this.tablename;
    this.groupname = this.group ? this.group.name : this.groupname;
  }

  /**
   * Sets table to given value and updates names.
   * @param table to set.
   */
  setTable(table: TSTable) {
    this.table = table;
    this.updateNames();
  }
}
