/**
 * Author: Klaas Reineke
 * Software License:
 * MIT License
 *
 * Copyright (c) 2022 Klaas Reineke
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
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
  // Do anything after initialization but before ready
});

// When ready
Hooks.once('ready', async () => {
  // Do anything once the module is ready
  setTablesmithApi(new TablesmithApi());
  libWrapper.register(TABLESMITH_ID, 'TableResult.prototype.getChatText', tableResultChatTextWrapper, 'WRAPPER');
});

function tableResultChatTextWrapper(this: TableResult, wrapped: () => string): string {
  const originalResult = wrapped();
  let replacedResult = originalResult;
  const tableCallValues = getTablesmithApi().parseEvaluateExpression(originalResult);
  if (tableCallValues) {
    replacedResult = getTablesmithApi().evaluateTable(tableCallValues);
    Logger.debug(false, 'Original and replaced result', originalResult, replacedResult);
  }
  return replacedResult;
}

// Add any additional hooks if necessary
Hooks.once('devModeReady', ({ registerPackageDebugFlag }: DevModeApi): void => {
  registerPackageDebugFlag(TABLESMITH_ID, 'level', { default: LOG_LEVEL.INFO });
});
