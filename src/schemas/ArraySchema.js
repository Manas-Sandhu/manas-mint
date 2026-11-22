/**
 * Mint - Array Schema
 *
 * Validates arrays and their individual elements.
 */

import { Schema } from "../core/Schema.js";

export class ArraySchema extends Schema {
  constructor(elementSchema, checks = []) {
    super({
      type: "array",
      element: elementSchema,
    });

    this.elementSchema = elementSchema;
    this.checks = [...checks];
  }

  _addCheck(check) {
    return new ArraySchema(this.elementSchema, [...this.checks, check]);
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

    this._validateChecks(context, value);

    const parsed = [];

    for (let index = 0; index < value.length; index++) {
      const childContext = context.child(index, value[index]);

      const parsedValue = this.elementSchema._parse(childContext, value[index]);

      if (isPromise(parsedValue)) {
        throw new Error(
          "Asynchronous array element validation requires async parsing.",
        );
      }

      parsed.push(parsedValue);
    }

    return parsed;
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

    this._validateChecks(context, value);

    const parsed = [];

    for (let index = 0; index < value.length; index++) {
      const childContext = context.child(index, value[index]);

      const parsedValue = await this.elementSchema._parseAsync(
        childContext,
        value[index],
      );

      parsed.push(parsedValue);
    }

    return parsed;
  }

  _validateChecks(context, value) {
    for (const check of this.checks) {
      if (!check.validate(value)) {
        context.addIssue({
          code: check.code,
          message: check.message,
          ...check.metadata,
        });
      }
    }
  }

  min(value, message) {
    return this._addCheck({
      code: "too_small",
      validate: (input) => input.length >= value,
      message: message ?? `Array must contain at least ${value} element(s)`,
      metadata: {
        minimum: value,
        inclusive: true,
        type: "array",
      },
    });
  }

  max(value, message) {
    return this._addCheck({
      code: "too_big",
      validate: (input) => input.length <= value,
      message: message ?? `Array must contain at most ${value} element(s)`,
      metadata: {
        maximum: value,
        inclusive: true,
        type: "array",
      },
    });
  }

  length(value, message) {
    return this._addCheck({
      code: "invalid_length",
      validate: (input) => input.length === value,
      message: message ?? `Array must contain exactly ${value} element(s)`,
      metadata: {
        length: value,
        type: "array",
      },
    });
  }

  nonempty(message) {
    return this.min(1, message ?? "Array cannot be empty");
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