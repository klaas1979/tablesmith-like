import TablesmithApi from './tablesmithapi';

export const TABLESMITH_ID = 'tablesmith-like';
export const SETTING_CHAT = 'default-chat';

/**
 * Returns game instance if initialized.
 * Helper to access Types see: https://github.com/League-of-Foundry-Developers/foundry-vtt-types/wiki/FAQ
 * @returns The current game instance.
 */
export function getGame(): Game {
  if (!(game instanceof Game)) {
    throw new Error('game is not initialized yet!');
  }
  return game;
}

/**
 * Returns journal instance if initialized.
 * Helper to access Types see: https://github.com/League-of-Foundry-Developers/foundry-vtt-types/wiki/FAQ
 * @returns The journal instance from game.
 */
export function getJournal(): Journal {
  const journal = getGame().journal;
  if (!(journal instanceof Journal)) {
    throw new Error('journal is not initialized yet!');
  }
  return journal;
}

/**
 * Returns macrois instance if initialized.
 * Helper to access Types see: https://github.com/League-of-Foundry-Developers/foundry-vtt-types/wiki/FAQ
 * @returns The macros instance from game.
 */
export function getMacros(): Macros {
  const macros = getGame().macros;
  if (!(macros instanceof Macros)) {
    throw new Error('macros is not initialized yet!');
  }
  return macros;
}

/**
 * Searches macro for name and returns it.
 * @param name of marcro to find.
 * @returns Macro for name or null if not found.
 */
export function findMacro(name: string): StoredDocument<Macro> | undefined {
  const macro = getMacros().find((macro) => {
    return macro.name == name;
  });
  return macro;
}

interface TablesmithModuleData {
  api: TablesmithApi;
}
/**
 * Initialization helper, to set API.
 * @param api to set to Tablesmith game module.
 */
export function setTablesmithApi(api: TablesmithApi): void {
  const data = getGame().modules.get(TABLESMITH_ID) as unknown as TablesmithModuleData;
  data.api = api;
}

/**
 * Returns the set tablesmith API.
 * @returns TablesmithApi from games module.
 */
export function getTablesmithApi(): TablesmithApi {
  const data = getGame().modules.get(TABLESMITH_ID) as unknown as TablesmithModuleData;
  return data.api;
}
