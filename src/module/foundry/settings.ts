import {
  getGame,
  SETTING_FORM_LAST_TABLE,
  SETTING_IMPORT_FOLDERS,
  SETTING_JOURNAL_FILE,
  SETTING_JOURNAL_FOLDER,
  SETTING_TSD_FOLDER,
  TABLESMITH_ID,
} from './helper';

/**
 * All settings to register for module.
 */
export function registerSettings(): void {
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

  getGame().settings.register(TABLESMITH_ID, SETTING_JOURNAL_FOLDER, {
    name: 'TABLESMITH.settings.journal-folder.name',
    hint: 'TABLESMITH.settings.journal-folder.hint',
    scope: 'world',
    config: true,
    type: String,
    default: 'Tablesmith',
  });

  getGame().settings.register(TABLESMITH_ID, SETTING_JOURNAL_FILE, {
    name: 'TABLESMITH.settings.journal-file.name',
    hint: 'TABLESMITH.settings.journal-file.hint',
    scope: 'world',
    config: true,
    type: String,
    default: 'Roll Results',
  });

  getGame().settings.register(TABLESMITH_ID, SETTING_FORM_LAST_TABLE, {
    scope: 'world',
    config: false,
    type: String,
    default: '',
  });
}
