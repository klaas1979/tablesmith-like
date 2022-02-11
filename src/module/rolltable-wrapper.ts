import { getTablesmithApi, TABLESMITH_ID } from './foundry/helper';
import { Logger } from './foundry/logger';
import { libWrapper } from './foundry/shims/libwrappershim';
import CallResult from './tablesmith/callresult';

const mappedResults = new Map<string, CallResult[]>();

/**
 * Wrap methods of RollTable to enhance draws that are a Tablesmith call.
 */
export function wrapRollTable(): void {
  libWrapper.register(TABLESMITH_ID, 'TableResult.prototype.getChatText', tableResultChatTextWrapper, 'WRAPPER');
  libWrapper.register(TABLESMITH_ID, 'RollTable.prototype.draw', rollTableDrawWrapper, 'WRAPPER');
}

/**
 * Checks draw for Tablesmith results evaluates them and registers results for wrapped getChatText.
 * @param this instance of this.
 * @param wrapped the method that is wrapped, to call it.
 * @param options for call.
 * @returns result of draw.
 */
async function rollTableDrawWrapper(
  this: RollTable,
  // eslint-disable-next-line @typescript-eslint/ban-types
  wrapped: (options: { displayChat: boolean; rollMode: string }) => Promise<RollTableDraw>,
  // eslint-disable-next-line @typescript-eslint/ban-types
  options: { displayChat: boolean; rollMode: string },
): Promise<RollTableDraw> {
  const displayChat = options.displayChat === undefined ? true : options.displayChat;
  options.displayChat = false;
  const draw = await wrapped(options);
  if (displayChat) {
    for (const result of draw.results) {
      const text = result.getChatText();
      const tableCallValues = getTablesmithApi().parseEvaluateCall(text);
      if (tableCallValues) {
        Logger.debug(false, 'tableCallValues', tableCallValues);
        const tsResult = await getTablesmithApi().evaluateTable(tableCallValues, { chatResults: false });
        storeResult(text, tsResult);
      }
    }
    const rollMode = options.rollMode;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    await this.toMessage(draw.results, { roll: draw.roll, messageOptions: { rollMode } });
  }
  return draw;
}

function storeResult(key: string, result: CallResult): void {
  if (!mappedResults.get(key)) mappedResults.set(key, []);
  mappedResults.get(key)?.push(result);
  Logger.debug(false, 'Storing Tablesmith result for call', key, result);
}

/**
 * Checks if the string representation is a Tablesmith call where an executed result should be returned instead.
 * @param this TableResult as class of wrapped function.
 * @param wrapped the wrapped funtion to call.
 * @returns string that is possible a tablesmith enhanced call.
 */
function tableResultChatTextWrapper(this: TableResult, wrapped: () => string): string {
  let chatText = wrapped();
  const mapped = mappedResults.get(chatText);
  const tsResult = mapped?.shift();
  if (tsResult) chatText = asString(tsResult);
  return chatText;
}

function asString(callResult: CallResult): string {
  if (callResult.isError()) return callResult.getErrorMessage();
  let result = '';
  callResult.forEach((r, index) => {
    result += `<h2>#${index}</h2>`;
    result += `<p>${r.asString()}</p>`;
  });
  return result;
}
