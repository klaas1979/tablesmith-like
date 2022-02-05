import { getGame } from './helper';
import { TableCallValues } from './tablecallvalues';

export default class ChatResults {
  /**
   * Chats given results.
   * @param expression the results are based on.
   * @param results retrieved results to chat.
   */
  chatResults(callValues: TableCallValues, results: string[] | string): void {
    if (typeof results == 'string') {
      this._chatResult(callValues, results, 1);
    } else {
      results.forEach((res, index) => {
        this._chatResult(callValues, res, index + 1);
      });
    }
  }

  _chatResult(callValues: TableCallValues, result: string, index: number) {
    const speaker = ChatMessage.getSpeaker();
    const heading = this._createHeading(callValues, index);
    ChatMessage.create({
      flavor: heading,
      user: getGame().user?.id,
      speaker: speaker,
      type: CONST.CHAT_MESSAGE_TYPES.OTHER,
      content: result,
    });
  }

  _createHeading(callValues: TableCallValues, index: number) {
    const group = callValues.groupname != 'Start' ? `.${callValues.groupname}` : '';
    const counter = callValues.rollCount > 1 ? ` (${index}/${callValues.rollCount})` : '';
    const heading = `Table: ${callValues.tablename}${group}${counter}`;
    return heading;
  }
}
