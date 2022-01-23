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
import { getTablesmithApi, setTablesmithApi, TABLESMITH_ID } from './foundry/helper';
import { Logger, DevModeApi, LOG_LEVEL } from './foundry/logger';
import TablesmithApi from './foundry/tablesmithapi';
import { libWrapper } from './foundry/shims/libwrappershim';

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

// Setup module
Hooks.once('setup', async () => {
  // Do anything after initialization but before
  // ready
});

// When ready
Hooks.once('ready', async () => {
  // Do anything once the module is ready
  setTablesmithApi(new TablesmithApi());
  //libWrapper.register(TABLESMITH_ID, 'RollTable.prototype.draw', drawWrapper, 'WRAPPER');
  libWrapper.register(TABLESMITH_ID, 'TableResult.prototype.getChatText', tableResultChatTextWrapper, 'WRAPPER');
});

function tableResultChatTextWrapper(this: TableResult, wrapped: () => string): string {
  const originalResult = wrapped();
  const replacedResult = getTablesmithApi().replaceTablesmithCalls(originalResult);
  Logger.debug(false, 'Original and replaced result', originalResult, replacedResult);
  return replacedResult;
}

// Add any additional hooks if necessary
Hooks.once('devModeReady', ({ registerPackageDebugFlag }: DevModeApi): void => {
  registerPackageDebugFlag(TABLESMITH_ID, 'level', { default: LOG_LEVEL.INFO });
});
