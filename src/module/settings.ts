// Helper to access Types see: https://github.com/League-of-Foundry-Developers/foundry-vtt-types/wiki/FAQ
function getGame(): Game {
  if (!(game instanceof Game)) {
    throw new Error('game is not initialized yet!');
  }
  return game;
}
export function registerSettings(): void {
  getGame().settings.register('foundryvtt-tablesmith', 'currentChaos', {
    name: 'Tablesmith Journal',
    hint: 'Journal containing all tables to register',
    scope: 'world',
    config: true,
    type: Number,
    default: 5,
  });
}
