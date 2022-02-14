import { getGame } from '../helper';
import { Logger } from '../logger';

/**
 * Dialog that prompts for user input.
 * @param prompt The prompt for entered test, as defined within TS InputText function.
 * @param defaultValue the default value to add.
 * @returns entered string or defaultvalue if closed without submit.
 */
export async function promptForInputText(prompt: string, defaultValue: string): Promise<string> {
  try {
    let entered = await Dialog.prompt({
      title: getGame().i18n.localize('TABLESMITH.evaluate.input-text'),
      content: `<div class="form-group"><label for="input">${prompt}</label><input id="input" name="input" type="text" value="${defaultValue}"></div>`,
      // When closed it will give us the number
      callback: (html) => html.find('input').val(),
    });
    if (entered === undefined) entered = defaultValue;
    else if (typeof entered === 'number') entered = `${entered}`;
    else if (typeof entered === 'string') entered = entered;
    else entered = entered.join(',');
    return entered;
  } catch (error) {
    Logger.debug(false, 'InputText dialog was closed not submitted, returning default value', defaultValue);
    return defaultValue;
  }
}
