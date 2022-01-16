export const TABLESMITH_ID = 'tablesmith-like';

/**
 * Returns game instance if initialized.
 * Helper to access Types see: https://github.com/League-of-Foundry-Developers/foundry-vtt-types/wiki/FAQ
 * @returns The current game instance.
 */
export function getGame(): Game {
  if (!(game instanceof Game)) {
    throw new Error('game is not initialized yet!');
  }
  return game;
}

/**
 * Returns journal instance if initialized.
 * Helper to access Types see: https://github.com/League-of-Foundry-Developers/foundry-vtt-types/wiki/FAQ
 * @returns The journal instance from game.
 */
export function getJournal(): Journal {
  const journal = getGame().journal;
  if (!(journal instanceof Journal)) {
    throw new Error('journal is not initialized yet!');
  }
  return journal;
}
