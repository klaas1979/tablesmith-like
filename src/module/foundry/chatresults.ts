import CallResult from '../tablesmith/callresult';
import { TSExpressionResult } from '../tablesmith/expressions/tsexpressionresult';
import { getGame } from './helper';
import { TableCallValues } from './tablecallvalues';

export default class ChatResults {
  /**
   * Chats given results.
   * @param expression the results are based on.
   * @param result retrieved results to chat.
   */
  chatResults(callValues: TableCallValues, result: CallResult): void {
    if (result.size() == 1) {
      this._chatResult(callValues, result.get(0), 1);
    } else {
      // TODO iterator erstellen, damit vernünftig iteriert werden kann
      result.forEach((res, index) => {
        this._chatResult(callValues, res, index + 1);
      });
    }
  }

  _chatResult(callValues: TableCallValues, result: TSExpressionResult, index: number) {
    const speaker = ChatMessage.getSpeaker();
    const heading = this._createHeading(callValues, index);
    ChatMessage.create({
      flavor: heading,
      user: getGame().user?.id,
      speaker: speaker,
      type: CONST.CHAT_MESSAGE_TYPES.OTHER,
      content: result.asString(),
    });
  }

  _createHeading(callValues: TableCallValues, index: number) {
    const group = callValues.groupname != 'Start' ? `.${callValues.groupname}` : '';
    const counter = callValues.rollCount > 1 ? ` (${index}/${callValues.rollCount})` : '';
    const heading = `Table: ${callValues.tablename}${group}${counter}`;
    return heading;
  }
}
