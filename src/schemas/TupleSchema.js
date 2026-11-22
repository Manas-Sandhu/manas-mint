/**
 * Mint - Tuple Schema
 *
 * Validates arrays with position-specific schemas.
 * Supports fixed tuples and optional rest schemas.
 */

import { Schema } from "../core/Schema.js";

export class TupleSchema extends Schema {
  constructor(schemas, restSchema = null) {
    validateSchemas(schemas);

    super({
      type: "tuple",
      items: Object.freeze([...schemas]),
      rest: restSchema,
    });

    this.items = Object.freeze([...schemas]);
    this.restSchema = restSchema;
  }

  _parse(context, value) {
    if (!Array.isArray(value)) {
      context.addIssue({
        code: "invalid_type",
        expected: "array",
        received: getType(value),
        message: `Expected array, received ${getType(value)}`,
      });

      return value;
    }

    const minimumLength = this.items.length;

    if (value.length < minimumLength) {
      context.addIssue({
        code: "too_small",
        minimum: minimumLength,
        inclusive: true,
        type: "array",
        message: `Array must contain at least ${minimumLength} element(s)`,
      });
    }

    if (!this.restSchema && value.length > this.items.length) {
      context.addIssue({
        code: "too_big",
        maximum: this.items.length,
        inclusive: true,
        type: "array",
        message: `Array must contain at most ${this.items.length} element(s)`,
      });
    }

    const output = [];

    const length = this.restSchema
      ? value.length
      : Math.min(value.length, this.items.length);

    for (let index = 0; index < length; index++) {
      const schema =
        index < this.items.length ? this.items[index] : this.restSchema;

      if (!schema) {
        output.push(value[index]);
        continue;
      }

      const childContext = context.child(index, value[index]);

      const parsedValue = schema._parse(childContext, value[index]);

      if (isPromise(parsedValue)) {
        throw new Error(
          "Asynchronous tuple validation requires async parsing.",
        );
      }

      output.push(parsedValue);
    }

    return output;
  }

  async _parseAsync(context, value) {
    if (!Array.isArray(value)) {
      context.addIssue({
        code: "invalid_type",
        expected: "array",
        received: getType(value),
        message: `Expected array, received ${getType(value)}`,
      });

      return value;
    }

    const minimumLength = this.items.length;

    if (value.length < minimumLength) {
      context.addIssue({
        code: "too_small",
        minimum: minimumLength,
        inclusive: true,
        type: "array",
        message: `Array must contain at least ${minimumLength} element(s)`,
      });
    }

    if (!this.restSchema && value.length > this.items.length) {
      context.addIssue({
        code: "too_big",
        maximum: this.items.length,
        inclusive: true,
        type: "array",
        message: `Array must contain at most ${this.items.length} element(s)`,
      });
    }

    const output = [];

    const length = this.restSchema
      ? value.length
      : Math.min(value.length, this.items.length);

    for (let index = 0; index < length; index++) {
      const schema =
        index < this.items.length ? this.items[index] : this.restSchema;

      if (!schema) {
        output.push(value[index]);
        continue;
      }

      const childContext = context.child(index, value[index]);

      const parsedValue = await schema._parseAsync(childContext, value[index]);

      output.push(parsedValue);
    }

    return output;
  }

  /**
   * Validate additional tuple elements with a schema.
   */
  rest(schema) {
    validateSchema(schema);

    return new TupleSchema(this.items, schema);
  }
}

function validateSchemas(schemas) {
  if (!Array.isArray(schemas)) {
    throw new TypeError("TupleSchema expects an array of schemas.");
  }

  for (const schema of schemas) {
    validateSchema(schema);
  }
}

function validateSchema(schema) {
  if (!schema || typeof schema._parse !== "function") {
    throw new TypeError("Tuple elements must be valid schemas.");
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