import { getGame, SETTING_CHAT, SETTING_IMPORT_FOLDERS, SETTING_TSD_FOLDER, TABLESMITH_ID } from './helper';

/**
 * All settings to register for module.
 */
export function registerSettings(): void {
  getGame().settings.register(TABLESMITH_ID, SETTING_CHAT, {
    name: 'TABLESMITH.settings.chat-results.name',
    hint: 'TABLESMITH.settings.chat-results.hint',
    scope: 'world',
    config: true,
    type: Boolean,
    default: true,
  });

  getGame().settings.register(TABLESMITH_ID, SETTING_IMPORT_FOLDERS, {
    name: 'TABLESMITH.settings.import-folders.name',
    hint: 'TABLESMITH.settings.import-folders.hint',
    scope: 'world',
    config: true,
    type: String,
    default: 'Examples',
  });

  getGame().settings.register(TABLESMITH_ID, SETTING_TSD_FOLDER, {
    name: 'TABLESMITH.settings.tsd-journal-folder.name',
    hint: 'TABLESMITH.settings.tsd-journal-folder.hint',
    scope: 'world',
    config: true,
    type: String,
    default: 'Tablesmith Data',
  });
}
