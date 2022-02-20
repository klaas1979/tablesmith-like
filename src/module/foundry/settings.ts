import { getGame, SETTING_CHAT, SETTING_IMPORT_FOLDERS, TABLESMITH_ID } from './helper';

/**
 * All settings to register for module.
 */
export function registerSettings(): void {
  getGame().settings.register(TABLESMITH_ID, SETTING_CHAT, {
    name: getGame().i18n.localize('TABLESMITH.settings.chat-results.name'),
    hint: getGame().i18n.localize('TABLESMITH.settings.chat-results.hint'),
    scope: 'world',
    config: true,
    type: Boolean,
    default: true,
  });

  getGame().settings.register(TABLESMITH_ID, SETTING_IMPORT_FOLDERS, {
    name: getGame().i18n.localize('TABLESMITH.settings.import-folders.name'),
    hint: getGame().i18n.localize('TABLESMITH.settings.import-folders.hint'),
    scope: 'world',
    config: true,
    type: String,
    default: 'Examples', // TODO getGame().i18n.localize('TABLESMITH.settings.import-folders.default'),
  });
}

/**
 * Returns the chat Results setting.
 * @returns boolean true if results should be chatted by default, false if not.
 */
export function chatResults(): boolean {
  const chat = getGame().settings.get(TABLESMITH_ID, SETTING_CHAT);
  return chat !== undefined && `${chat}` === 'true';
}
/**
 * All folders of module Journal tables to import.
 * @returns string[] of all folders.
 */
export function importFolders(): string[] {
  const folders = getGame().settings.get(TABLESMITH_ID, SETTING_IMPORT_FOLDERS) as string;
  return folders !== undefined ? folders.split(',') : [];
}
