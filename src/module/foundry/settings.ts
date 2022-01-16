import { getGame } from './helper';

/**
 * All settings to register for module.
 */
export function registerSettings(): void {
  getGame().settings.register('tablesmith-like', 'currentChaos', {
    name: 'Tablesmith Journal',
    hint: 'Journal containing all tables to register',
    scope: 'world',
    config: true,
    type: Number,
    default: 5,
  });
}
