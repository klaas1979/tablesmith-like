/**
 * This is your TypeScript entry file for Foundry VTT.
 * Register custom settings, sheets, and constants using the Foundry API.
 * Change this heading to be more descriptive to your module, or remove it.
 * Author: Klaas Reineke
 * Content License: [copyright and-or license] If using an existing system
 * 					you may want to put a (link to a) license or copyright
 * 					notice here (e.g. the OGL).
 * Software License: [your license] Put your desired license here, which
 * 					 determines how others may use and modify your module.
 */

// Import TypeScript modules
import { getGame, registerSettings } from './foundry/settings';
import { preloadTemplates } from './foundry/preloadTemplates';
import { tablesmith } from './tablesmith/tablesmithinstance';

// Initialize module
Hooks.once('init', async () => {
  console.log('foundryvtt-tablesmith | Initializing foundryvtt-tablesmith');

  // Assign custom classes and constants here

  // Register custom module settings
  registerSettings();

  // Preload Handlebars templates
  await preloadTemplates();

  // Register custom sheets (if any)
});

// Setup module
Hooks.once('setup', async () => {
  // Do anything after initialization but before
  // ready
  tablesmith.addTable('name', ':Start\n1,One');
});

// When ready
Hooks.once('ready', async () => {
  // Do anything once the module is ready
});

// Add any additional hooks if necessary

export default class MGMEChatJournal {
  static async _mgmeFindOrCreateJournal() {
    const date = new Date().toDateInputString();
    const folderName = 'Mythic Journal';
    const journalName = 'Adventure Notes ' + date;
    let journal = getGame().journal?.contents.find((j) => j.name === journalName && j.folder?.name === folderName);
    if (!journal) {
      let folder = getGame().folders?.contents.find((f) => f.name === folderName);
      if (!folder) folder = await Folder.create({ name: folderName, type: 'JournalEntry' });
      journal = await JournalEntry.create({ name: journalName, folder: folder });
    }
    return journal;
  }
}
