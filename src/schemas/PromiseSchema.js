/**
 * Mint - Promise Schema
 *
 * Validates Promise-like values and their resolved data.
 */

import { Schema } from "../core/Schema.js";

export class PromiseSchema extends Schema {
  constructor(valueSchema) {
    validateSchema(valueSchema);

    super({
      type: "promise",
      valueSchema,
    });

    this.valueSchema = valueSchema;
  }

  _parse(context, value) {
    if (!isPromise(value)) {
      context.addIssue({
        code: "invalid_type",
        expected: "promise",
        received: getType(value),
        message: `Expected Promise, received ${getType(value)}`,
      });

      return value;
    }

    return value.then((resolvedValue) => {
      const childContext = context.child("resolved", resolvedValue);

      return this.valueSchema._parse(childContext, resolvedValue);
    });
  }

  async _parseAsync(context, value) {
    if (!isPromise(value)) {
      context.addIssue({
        code: "invalid_type",
        expected: "promise",
        received: getType(value),
        message: `Expected Promise, received ${getType(value)}`,
      });

      return value;
    }

    const resolvedValue = await value;

    const childContext = context.child("resolved", resolvedValue);

    return this.valueSchema._parseAsync(childContext, resolvedValue);
  }
}

function validateSchema(schema) {
  if (!schema || typeof schema._parse !== "function") {
    throw new TypeError("PromiseSchema requires a valid value schema.");
  }
}

function isPromise(value) {
  return (
    value !== null &&
    (typeof value === "object" || typeof value === "function") &&
    typeof value.then === "function"
  );
}

function getType(value) {
  if (value === null) return "null";

  if (isPromise(value)) return "promise";

  if (Array.isArray(value)) return "array";

  return typeof value;
}