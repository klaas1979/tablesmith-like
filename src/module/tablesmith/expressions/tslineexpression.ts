import TSGroup from '../tsgroup';
import TSExpression from './tsexpression';

/**
 * Simple Line Expression that separates the Output via a Line or other visual cue.
 */
class TSLineExpression implements TSExpression {
  alignExpression: TSExpression;
  widthExpression: TSExpression;

  constructor(alignExpression: TSExpression, widthExpression: TSExpression) {
    this.alignExpression = alignExpression;
    this.widthExpression = widthExpression;
  }
  evaluate(): string {
    this.evaluateAlign();
    this.evaluateWidth();
    return `<br/>`;
  }

  private evaluateAlign(): string {
    const align = this.alignExpression.evaluate().trim();
    const allowed = ['left', 'center', 'right'];
    if (!allowed.includes(align)) throw `Align was '${align}', allowed values '${allowed.join(',')}'`;
    return align;
  }

  private evaluateWidth() {
    const width = this.widthExpression.evaluate();
    const widthNum = Number.parseInt(width);
    if (Number.isNaN(widthNum)) throw `Width was '${width}', allowed values integer between 1-100`;
    return widthNum;
  }

  getExpression(): string {
    return `{Line~${this.alignExpression.getExpression()},${this.widthExpression.getExpression()}%}`;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setGroup(group: TSGroup): void {
    // empty
  }
}

export default TSLineExpression;
