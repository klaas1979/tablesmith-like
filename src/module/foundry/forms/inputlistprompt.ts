import { getGame, TABLESMITH_ID } from '../helper';
import { Logger } from '../logger';

/**
 * Dialog that prompts for user input from list.
 * @param defaultValue the default option to select starting at 1 (not zero based).
 * @param prompt The prompt for select, as defined within TS InputList function.
 * @param options the options to display.
 * @returns number of selected input starting by 1 (not zero based).
 */
export async function promptForInputList(defaultValue: number, prompt: string, options: string[]): Promise<number> {
  try {
    const data = {
      prompt: prompt,
      defaultValue: defaultValue,
      options: options.map((option, index) => {
        return { index: index + 1, value: option };
      }),
    };
    const select = await renderTemplate(`modules/${TABLESMITH_ID}/templates/inputlist.hbs`, data);
    let entered = await Dialog.prompt({
      title: getGame().i18n.localize('TABLESMITH.evaluate.input-list'),
      content: select,
      // When closed it will give us the number
      callback: (html) => html.find('option').filter(':selected').val(),
    });
    if (entered === undefined) entered = defaultValue;
    else if (typeof entered === 'number') entered = entered;
    else if (typeof entered === 'string') entered = Number.parseInt(entered);
    else entered = Number.parseInt(entered.join(''));
    if (Number.isNaN(entered) && 0 >= entered && entered > options.length) entered = defaultValue;
    return entered;
  } catch (error) {
    Logger.debug(false, 'InputList dialog was closed not submitted, returning default value', defaultValue);
    return defaultValue;
  }
}
