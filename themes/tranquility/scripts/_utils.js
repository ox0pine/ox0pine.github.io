'use strict';

/**
 * Flatten every value reachable through nested objects/arrays.
 * Arrays are flattened too, so callers can pass mixed config shapes.
 */
function getObjValues(obj) {
  if (obj === null || obj === undefined) return [];
  if (typeof obj !== 'object') return [obj];

  return Object.values(obj).flatMap(getObjValues);
}

module.exports = { getObjValues };
