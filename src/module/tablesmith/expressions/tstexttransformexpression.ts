import EvaluationContext from './evaluationcontext';
import { BaseTSExpression } from './tsexpression';
import { TSExpressionResult, SingleTSExpressionResult } from './tsexpressionresult';
import TSExpressions from './tsexpressions';

/**
 * Simple Text changing functions.
 */
export default class TSTextTransformExpression extends BaseTSExpression {
  name: string;
  textExpression: TSExpressions;
  constructor(name: string, textExpression: TSExpressions) {
    super();
    this.name = name;
    this.textExpression = textExpression;
  }
  async evaluate(evalcontext: EvaluationContext): Promise<TSExpressionResult> {
    const text = (await this.textExpression.evaluate(evalcontext)).asString();
    let result;
    switch (this.name) {
      case 'AorAn':
        result = this.isVowelStart(text) ? `an ${text}` : `a ${text}`;
        break;
      case 'Cap':
        result = text.charAt(0).toUpperCase() + text.slice(1);
        break;
      case 'CapEachWord':
        result = this.capEachWord(text);
        break;
      case 'LCase':
        result = text.toLowerCase();
        break;
      case 'Length':
        result = text.length;
        break;
      case 'Trim':
        result = text.trim();
        break;
      case 'UCase':
        result = text.toUpperCase();
        break;
      case 'VowelStart':
        result = this.isVowelStart(text) ? '1' : '0';
        break;
      default:
        throw Error(`Unknown function '${this.name}'`);
    }
    return new SingleTSExpressionResult(result);
  }

  private capEachWord(text: string): string {
    return text
      .split(' ')
      .map((word) => {
        return word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join(' ');
  }

  private isVowelStart(text: string): boolean {
    return text.match(/[aeiou].*/i) !== null;
  }

  getExpression(): string {
    return `{${this.name}~${this.textExpression.getExpression()}}`;
  }
}
