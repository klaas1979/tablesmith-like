import CallResult from '../tablesmith/callresult';
import { TSExpressionResult } from '../tablesmith/expressions/tsexpressionresult';
import { getGame, getResultJournalPage } from './helper';
import { Logger } from './logger';
import { TableCallValues } from './tablecallvalues';

export default class ResultsTo {
  /**
   * Chats given results.
   * @param expression the results are based on.
   * @param result retrieved results to chat.
   */
  chat(callValues: TableCallValues, result: CallResult): void {
    if (result.size() == 1) {
      this._chatResult(callValues, result.get(0), 1);
    } else {
      result.forEach((res, index) => {
        this._chatResult(callValues, res, index + 1);
      });
    }
  }

  /**
   * Appends given results to configured journal.
   * @param expression the results are based on.
   * @param result retrieved results to add to journal.
   */
  async journal(
    callValues: TableCallValues,
    results: CallResult,
    journal?: { folder: string; name: string },
    options: { includeTimestamp?: boolean; notify?: boolean } = { includeTimestamp: true, notify: true },
  ): Promise<void> {
    const pageName = new Date().toDateInputString();
    const journalPage = await getResultJournalPage(pageName, journal);
    Logger.debug(false, 'Found JournalPage', journalPage, journalPage.text.content);
    const message = this._createJournalMessage(callValues, results, options);
    journalPage.update({ text: { content: message + journalPage.text.content } });
    if (options.notify)
      ui.notifications?.info(getGame().i18n.localize('TABLESMITH.evaluate.result-to.journal-updated'));
    Logger.debug(false, 'Journal updated with result', journalPage);
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

  _createHeading(callValues: TableCallValues, index?: number) {
    const group = callValues.groupname != 'Start' ? `.${callValues.groupname}` : '';
    const counter = callValues.rollCount > 1 && index ? ` (${index}/${callValues.rollCount})` : '';
    const heading = `Table: ${callValues.tablename}${group}${counter}`;
    return heading;
  }

  _createJournalMessage(
    callValues: TableCallValues,
    result: CallResult,
    options: { includeTimestamp?: boolean; notify?: boolean } = { includeTimestamp: true },
  ) {
    let content = '';
    if (options.includeTimestamp)
      content += `<h1>${this._createHeading(callValues)} (${new Date().toTimeInputString()})</h1>`;
    result.results.forEach((r, index) => {
      if (result.size() > 1) content += `<h2>#${index}</h2>`;
      content += '<div>';
      content += r.result.asString();
      content += '</div>';
    });
    return content;
  }
}
