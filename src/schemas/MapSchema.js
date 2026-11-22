/**
 * Mint - Map Schema
 *
 * Validates native JavaScript Maps.
 * Supports key and value validation.
 */

import { Schema } from "../core/Schema.js";

export class MapSchema extends Schema {
  constructor(keySchema, valueSchema, checks = []) {
    validateSchema(keySchema);
    validateSchema(valueSchema);

    super({
      type: "map",
      keySchema,
      valueSchema,
      checks: Object.freeze([...checks]),
    });

    this.keySchema = keySchema;
    this.valueSchema = valueSchema;
    this.checks = Object.freeze([...checks]);
  }

  _parse(context, value) {
    if (!(value instanceof Map)) {
      context.addIssue({
        code: "invalid_type",
        expected: "map",
        received: getType(value),
        message: `Expected Map, received ${getType(value)}`,
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
          type: "map",
          message: check.message,
        });
      }
    }

    const output = new Map();

    for (const [key, entryValue] of value) {
      const keyContext = context.child(key, key);

      const parsedKey = this.keySchema._parse(keyContext, key);

      if (isPromise(parsedKey)) {
        throw new Error(
          "Asynchronous Map key validation requires async parsing.",
        );
      }

      const valueContext = context.child(key, entryValue);

      const parsedValue = this.valueSchema._parse(valueContext, entryValue);

      if (isPromise(parsedValue)) {
        throw new Error(
          "Asynchronous Map value validation requires async parsing.",
        );
      }

      output.set(parsedKey, parsedValue);
    }

    return output;
  }

  async _parseAsync(context, value) {
    if (!(value instanceof Map)) {
      context.addIssue({
        code: "invalid_type",
        expected: "map",
        received: getType(value),
        message: `Expected Map, received ${getType(value)}`,
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
          type: "map",
          message: check.message,
        });
      }
    }

    const output = new Map();

    for (const [key, entryValue] of value) {
      const keyContext = context.child(key, key);

      const parsedKey = await this.keySchema._parseAsync(keyContext, key);

      const valueContext = context.child(key, entryValue);

      const parsedValue = await this.valueSchema._parseAsync(
        valueContext,
        entryValue,
      );

      output.set(parsedKey, parsedValue);
    }

    return output;
  }

  min(minimum, message) {
    return this._addSizeCheck({
      code: "too_small",
      minimum,
      inclusive: true,
      message: message ?? `Map must contain at least ${minimum} entry(s)`,
      validate: (size) => size >= minimum,
    });
  }

  max(maximum, message) {
    return this._addSizeCheck({
      code: "too_big",
      maximum,
      inclusive: true,
      message: message ?? `Map must contain at most ${maximum} entry(s)`,
      validate: (size) => size <= maximum,
    });
  }

  size(length, message) {
    return this._addSizeCheck({
      code: "invalid_size",
      minimum: length,
      maximum: length,
      inclusive: true,
      message: message ?? `Map must contain exactly ${length} entry(s)`,
      validate: (size) => size === length,
    });
  }

  nonempty(message) {
    return this.min(1, message);
  }

  _addSizeCheck(check) {
    return new MapSchema(this.keySchema, this.valueSchema, [
      ...this.checks,
      check,
    ]);
  }
}

function validateSchema(schema) {
  if (!schema || typeof schema._parse !== "function") {
    throw new TypeError("Map key and value must be valid schemas.");
  }
}

function getType(value) {
  if (value === null) return "null";

  if (value instanceof Map) {
    return "map";
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