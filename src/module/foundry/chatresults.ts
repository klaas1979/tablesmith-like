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
    const group = callValues.groupname != 'Start' ? `.${callValues.groupname}` : '';
    const counter = callValues.rollCount > 1 ? ` (${index}/${callValues.rollCount})` : '';
    const heading = `Table: ${callValues.tablename}${group}${counter}`;
    const chatMessage = new ChatMessage({ flavor: heading, content: result });
    ui.chat?.postOne(chatMessage);
  }
}
