/**
 * Managed object of this form with all data.
 */
const enum MODFIERS {
  '+',
  '-',
  '=',
  'none',
}
export default class TableCallValues {
  tablename: string;
  groupname: string;
  modifier: MODFIERS;
  modifierValue: number;
  constructor() {
    this.tablename = '';
    this.groupname = 'Start';
    this.modifier = MODFIERS.none;
    this.modifierValue = 0;
  }

  /**
   * Creates a Tablesmith call expression in format: '['[tablename].[groupname]([modifier][modifiervalue])?']'
   * @returns Expression for Tablesmith evaluate.
   */
  createExpression(): string {
    let mod = '';
    if (this.modifier != MODFIERS.none) mod = `${this.modifier}${this.modifierValue}`;
    return `[${this.tablename}.${this.groupname}${mod}]`;
  }
}
