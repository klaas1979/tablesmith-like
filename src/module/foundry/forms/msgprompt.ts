import { getGame } from '../helper';
import { Logger } from '../logger';

/**
 * Dialog that displays message.
 * @param prompt The msg to display.
 */
export async function promptMsg(prompt: string): Promise<void> {
  try {
    await Dialog.prompt({
      title: getGame().i18n.localize('TABLESMITH.evaluate.msg'),
      content: `<p>${prompt}</p>`,
      callback: () => true,
    });
  } catch (error) {
    Logger.debug(false, 'Msg Dialog was closed via close');
  }
}
