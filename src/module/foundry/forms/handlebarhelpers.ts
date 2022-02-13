import CallResult from '../../tablesmith/callresult';
import { TSExpressionResult } from '../../tablesmith/expressions/tsexpressionresult';
import { Logger } from '../logger';

export async function registerHandlebarHelpers() {
  Handlebars.registerHelper('ts-add', function (a: string, b: string): number {
    return Number.parseInt(a) + Number.parseInt(b);
  });

  Handlebars.registerHelper('ts-result', function (result: TSExpressionResult) {
    Logger.debug(false, 'ts-result', result);
    return result.asString();
  });

  Handlebars.registerHelper('ts-resultSummary', function (result: TSExpressionResult): string {
    let summary = result.asString();
    const length = summary.length;
    if (length > 300) summary = summary.substring(0, 148) + ' ... ' + summary.substring(length - 147, length);
    return summary;
  });

  Handlebars.registerHelper('ts-callError', function (result: CallResult): string {
    return result.getErrorMessage().replace(/Error: /g, '<br>Error: ');
  });
}
