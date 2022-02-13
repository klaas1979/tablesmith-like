import { getGame, SETTING_CHAT, TABLESMITH_ID } from './helper';

/**
 * All settings to register for module.
 */
export function registerSettings(): void {
  getGame().settings.register(TABLESMITH_ID, SETTING_CHAT, {
    name: 'Chat Results',
    hint: 'Default value indicating if Table results should be added to chat or not',
    scope: 'world',
    config: true,
    type: Boolean,
    default: true,
  });
}

/**
 * All settings to register for module.
 */
export function chatResults(): boolean {
  const chat = getGame().settings.get(TABLESMITH_ID, SETTING_CHAT);
  return chat !== undefined && `${chat}` === 'true';
}
