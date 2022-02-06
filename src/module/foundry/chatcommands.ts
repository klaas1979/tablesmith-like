import { ChatSpeakerData } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/chatSpeakerData';
import { getTablesmithApi } from './helper';
import { Logger } from './logger';

export default class ChatCommands {
  /**
   * Processes a Chat messages and calls Tablesmith table, if it is a Tablesmith command:
   * '/ts' or '/tablesmith'
   * @param _log not needed passed by Hook.
   * @param data the chatmessage to process, test.
   * @param  chatData object       Some basic chat data
   * @param {User} chatData.user      The User sending the message
   * @param {object} chatData.speaker The identified speaker data, see ChatMessage.getSpeaker.
   * @returns
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static process(_log: unknown, data: string, chatData: { user: User; speaker: ChatSpeakerData }): boolean {
    const tsre = '^(?:\\/(t(?:able)?s(?:mith)?))\\s*(.*)'; // Captures /ts and /tablesmith
    const match = new RegExp(tsre, 'i').exec(data);
    if (match) {
      try {
        const call = match[2];
        if (call) {
          getTablesmithApi().evaluateTable(call, { chatResults: true, lenient: true });
        } else Logger.info(false, 'Tablesmith Chat command without arguments, cannot call a table!', data);
        return false;
      } catch (error) {
        Logger.error(false, 'Chat command', data, error);
      }
    }
    return true;
  }
}
