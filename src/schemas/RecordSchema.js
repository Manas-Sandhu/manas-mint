/**
 * Mint - Record Schema
 *
 * Validates objects with consistent value schemas.
 * Optionally validates keys using a key schema.
 */

import { Schema } from "../core/Schema.js";
import { isPlainObject } from "../utils/objectUtils.js";

export class RecordSchema extends Schema {
  constructor(valueSchema, keySchema = null) {
    validateSchema(valueSchema);

    if (keySchema !== null) {
      validateSchema(keySchema);
    }

    super({
      type: "record",
      valueSchema,
      keySchema,
    });

    this.valueSchema = valueSchema;
    this.keySchema = keySchema;
  }

  _parse(context, value) {
    if (!isPlainObject(value)) {
      context.addIssue({
        code: "invalid_type",
        expected: "object",
        received: getType(value),
        message: `Expected object, received ${getType(value)}`,
      });

      return value;
    }

    const output = {};

    for (const key of Object.keys(value)) {
      const childContext = context.child(key, value[key]);

      // Validate key if a key schema was supplied.
      if (this.keySchema) {
        const parsedKey = this.keySchema._parse(childContext, key);

        if (isPromise(parsedKey)) {
          throw new Error(
            "Asynchronous record key validation requires async parsing.",
          );
        }

        if (childContext.hasIssues) {
          continue;
        }
      }

      const parsedValue = this.valueSchema._parse(childContext, value[key]);

      if (isPromise(parsedValue)) {
        throw new Error(
          "Asynchronous record validation requires async parsing.",
        );
      }

      output[key] = parsedValue;
    }

    return output;
  }

  async _parseAsync(context, value) {
    if (!isPlainObject(value)) {
      context.addIssue({
        code: "invalid_type",
        expected: "object",
        received: getType(value),
        message: `Expected object, received ${getType(value)}`,
      });

      return value;
    }

    const output = {};

    for (const key of Object.keys(value)) {
      const childContext = context.child(key, value[key]);

      // Validate key if a key schema was supplied.
      if (this.keySchema) {
        await this.keySchema._parseAsync(childContext, key);

        if (childContext.hasIssues) {
          continue;
        }
      }

      const parsedValue = await this.valueSchema._parseAsync(
        childContext,
        value[key],
      );

      output[key] = parsedValue;
    }

    return output;
  }
}

function validateSchema(schema) {
  if (!schema || typeof schema._parse !== "function") {
    throw new TypeError("Record key and value must be valid schemas.");
  }
}

function getType(value) {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";

  return typeof value;
}

function isPromise(value) {
  return (
    value !== null &&
    (typeof value === "object" || typeof value === "function") &&
    typeof value.then === "function"
  );
}