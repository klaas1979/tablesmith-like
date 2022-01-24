import { getGame, SETTING_CHAT, TABLESMITH_ID } from './helper';

/**
 * All settings to register for module.
 */
export function registerSettings(): void {
  getGame().settings.register(TABLESMITH_ID, SETTING_CHAT, {
    name: 'Chatablesmith Journal',
    hint: 'Journal containing all tables to register',
    scope: 'world',
    config: true,
    type: Boolean,
    default: true,
  });
}
