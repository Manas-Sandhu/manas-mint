/**
 * Mint - Object Utilities
 */

export function isPlainObject(value) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const prototype = Object.getPrototypeOf(value);

  return prototype === Object.prototype || prototype === null;
}

export function getObjectKeys(value) {
  return Object.keys(value);
}

export function hasOwn(object, key) {
  return Object.prototype.hasOwnProperty.call(object, key);
}

export function omitKeys(object, keys) {
  const excluded = new Set(keys);
  const result = {};

  for (const key of Object.keys(object)) {
    if (!excluded.has(key)) {
      result[key] = object[key];
    }
  }

  return result;
}

export function pickKeys(object, keys) {
  const selected = new Set(keys);
  const result = {};

  for (const key of Object.keys(object)) {
    if (selected.has(key)) {
      result[key] = object[key];
    }
  }

  return result;
}