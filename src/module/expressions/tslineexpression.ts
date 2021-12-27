import TSGroup from '../tsgroup';
import TSExpression from './tsexpression';

/**
 * Simple Line Expression that separates the Output via a Line or other visual cue.
 */
class TSLineExpression implements TSExpression {
  align: string;
  width: number;
  constructor(align: 'left' | 'center' | 'right', width: number) {
    this.align = align;
    this.width = width;
    if (width < 1 || width > 100) throw `Width must be between 1 and 100 got '${width}'`;
  }
  evaluate(): string {
    return `<br/>`;
  }
  getExpression(): string {
    return `{Line~${this.align},${this.width}%}`;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setGroup(group: TSGroup): void {
    // empty
  }
}

export default TSLineExpression;
