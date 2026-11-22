/**
 * Mint - Boolean Schema
 */

import { Schema } from "../core/Schema.js";

export class BooleanSchema extends Schema {
  constructor() {
    super({ type: "boolean" });
  }

  _parse(context, value) {
    if (typeof value !== "boolean") {
      context.addIssue({
        code: "invalid_type",
        expected: "boolean",
        received: getType(value),
        message: `Expected boolean, received ${getType(value)}`,
      });
    }

    return value;
  }
}

function getType(value) {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  return typeof value;
}