/**
 * List of TS Functions with correct case.
 */
const NAMES = [
  'Abs',
  'And',
  'Bold',
  'Italic',
  'Calc',
  'Dice',
  'AorAn',
  'Cap',
  'CapEachWord',
  'LCase',
  'Length',
  'UCase',
  'Trim',
  'VowelStart',
  'Count',
  'Ceil',
  'Char',
  'CR',
  'Color',
  'CommaReplace',
  'DSCount',
  'DSAdd',
  'DSAddNR',
  'DSCalc',
  'DSCreate',
  'DSFind',
  'DSGet',
  'DSSet',
  'DSRandomize',
  'DSRemove',
  'DSRead',
  'DSReadOrCreate',
  'DSWrite',
  'Floor',
  'Find',
  'Generate',
  'InputList',
  'InputText',
  'IsNumber',
  'Msg',
  'If',
  'IIf',
  'LastRoll',
  'Left',
  'Line',
  'Lockout',
  'Loop',
  'Min',
  'MinVal',
  'Max',
  'MaxVal',
  'Mid',
  'Mod',
  'Note',
  'Or',
  'Replace',
  'Reset',
  'Right',
  'Param',
  'Picture',
  'Power',
  'Round',
  'Trunc',
  'Select',
  'Split',
  'Sqrt',
  'Status',
  'Unlock',
  'While',
  'Xor',
];

const NAMES_MAP = new Map<string, string>();
NAMES.forEach((name) => {
  NAMES_MAP.set(name.toLowerCase(), name);
});

/**
 * Normalizes case of function to default definition.
 * @param name to normalize.
 * @returns TS Function with correct case.
 */
export function normalizeCase(name: string): string {
  const result = NAMES_MAP.get(name.toLowerCase());
  if (!result) throw Error(`Unknown function '${name}'`);
  return result;
}
