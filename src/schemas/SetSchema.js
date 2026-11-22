/**
 * Mint - Set Schema
 *
 * Validates native JavaScript Sets.
 * Supports element validation and size constraints.
 */

import { Schema } from "../core/Schema.js";

export class SetSchema extends Schema {
  constructor(valueSchema, checks = []) {
    validateSchema(valueSchema);

    super({
      type: "set",
      valueSchema,
      checks: Object.freeze([...checks]),
    });

    this.valueSchema = valueSchema;
    this.checks = Object.freeze([...checks]);
  }

  _parse(context, value) {
    if (!(value instanceof Set)) {
      context.addIssue({
        code: "invalid_type",
        expected: "set",
        received: getType(value),
        message: `Expected Set, received ${getType(value)}`,
      });

      return value;
    }

    const size = value.size;

    for (const check of this.checks) {
      const valid = check.validate(size);

      if (!valid) {
        context.addIssue({
          code: check.code,
          minimum: check.minimum,
          maximum: check.maximum,
          inclusive: check.inclusive,
          type: "set",
          message: check.message,
        });
      }
    }

    const output = new Set();
    let index = 0;

    for (const item of value) {
      const childContext = context.child(index, item);

      const parsedValue = this.valueSchema._parse(childContext, item);

      if (isPromise(parsedValue)) {
        throw new Error("Asynchronous Set validation requires async parsing.");
      }

      output.add(parsedValue);
      index++;
    }

    return output;
  }

  async _parseAsync(context, value) {
    if (!(value instanceof Set)) {
      context.addIssue({
        code: "invalid_type",
        expected: "set",
        received: getType(value),
        message: `Expected Set, received ${getType(value)}`,
      });

      return value;
    }

    const size = value.size;

    for (const check of this.checks) {
      const valid = check.validate(size);

      if (!valid) {
        context.addIssue({
          code: check.code,
          minimum: check.minimum,
          maximum: check.maximum,
          inclusive: check.inclusive,
          type: "set",
          message: check.message,
        });
      }
    }

    const output = new Set();
    let index = 0;

    for (const item of value) {
      const childContext = context.child(index, item);

      const parsedValue = await this.valueSchema._parseAsync(
        childContext,
        item,
      );

      output.add(parsedValue);
      index++;
    }

    return output;
  }

  min(minimum, message) {
    return this._addSizeCheck({
      code: "too_small",
      minimum,
      inclusive: true,
      message: message ?? `Set must contain at least ${minimum} element(s)`,
      validate: (size) => size >= minimum,
    });
  }

  max(maximum, message) {
    return this._addSizeCheck({
      code: "too_big",
      maximum,
      inclusive: true,
      message: message ?? `Set must contain at most ${maximum} element(s)`,
      validate: (size) => size <= maximum,
    });
  }

  size(length, message) {
    return this._addSizeCheck({
      code: "invalid_size",
      minimum: length,
      maximum: length,
      inclusive: true,
      message: message ?? `Set must contain exactly ${length} element(s)`,
      validate: (size) => size === length,
    });
  }

  nonempty(message) {
    return this.min(1, message);
  }

  _addSizeCheck(check) {
    return new SetSchema(this.valueSchema, [...this.checks, check]);
  }
}

function validateSchema(schema) {
  if (!schema || typeof schema._parse !== "function") {
    throw new TypeError("SetSchema requires a valid element schema.");
  }
}

function getType(value) {
  if (value === null) return "null";

  if (value instanceof Set) {
    return "set";
  }

  if (Array.isArray(value)) {
    return "array";
  }

  return typeof value;
}

function isPromise(value) {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof value.then === "function"
  );
}