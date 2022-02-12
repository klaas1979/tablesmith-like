import cloneDeep from 'lodash.cloneDeep';

let deepClone: <T>(value: T) => T;
if (cloneDeep) {
  deepClone = function deepClone<T>(value: T) {
    return cloneDeep(value);
  };
} else {
  deepClone = foundry.utils.deepClone;
}
if (!deepClone) throw Error('Could not initialize deepClone foundry and lodash.cloneDeep missing!');

export default deepClone;
