/**
 * This is your TypeScript entry file for Foundry VTT Tablesmith module.
 * Register custom settings, sheets, and constants using the Foundry API.
 * Author: Klaas Reineke
 * Content License: [copyright and-or license] If using an existing system
 * 					you may want to put a (link to a) license or copyright
 * 					notice here (e.g. the OGL).
 * Software License: [your license] Put your desired license here, which
 * 					 determines how others may use and modify your module.
 */

// Import TypeScript modules
import { registerSettings } from './foundry/settings';
import { preloadTemplates } from './foundry/preloadTemplates';
import JournalTables from './foundry/journaltables';
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
});

// When ready
Hooks.once('ready', async () => {
  // Do anything once the module is ready
  JournalTables.loadTablesFromJournal(tablesmith);
});

// Add any additional hooks if necessary
