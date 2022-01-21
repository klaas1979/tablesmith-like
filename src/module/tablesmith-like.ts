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
import { libWrapper } from './foundry/shims/libwrappershim';
import { registerSettings } from './foundry/settings';
import { preloadTemplates } from './foundry/preloadTemplates';
import { getGame, TABLESMITH_ID } from './foundry/helper';
import { Logger, DevModeApi, LOG_LEVEL } from './foundry/logger';
import TablesmithApi from './foundry/tablesmithapi';

// Initialize module
Hooks.once('init', async () => {
  Logger.info(true, 'Initializing tablesmith-like');

  // Assign custom classes and constants here

  // Register custom module settings
  registerSettings();

  // Preload Handlebars templates
  await preloadTemplates();

  // Register custom sheets (if any)
});

interface TablesmithModuleData {
  api: TablesmithApi;
}
// Setup module
Hooks.once('setup', async () => {
  // Do anything after initialization but before
  // ready
});

// When ready
Hooks.once('ready', async () => {
  // Do anything once the module is ready
  const tablesmithModuleData = getGame().modules.get(TABLESMITH_ID) as unknown as TablesmithModuleData;
  tablesmithModuleData.api = new TablesmithApi();
  libWrapper.register(
    TABLESMITH_ID,
    'RollTable.prototype.draw',
    function (wrapped, ...args) {
      Logger.debug(false, 'wrapped call to draw');
      return wrapped(...args);
    },
    'MIXED',
  );
});

// Add any additional hooks if necessary
Hooks.once('devModeReady', ({ registerPackageDebugFlag }: DevModeApi): void => {
  registerPackageDebugFlag(TABLESMITH_ID, 'level', { default: LOG_LEVEL.INFO });
});
