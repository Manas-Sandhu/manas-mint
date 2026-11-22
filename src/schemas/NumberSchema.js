/**
 * Mint - Number Schema
 */

import { Schema } from "../core/Schema.js";

export class NumberSchema extends Schema {
  constructor(checks = []) {
    super({ type: "number" });
    this.checks = [...checks];
  }

  _addCheck(check) {
    return new NumberSchema([...this.checks, check]);
  }

  _parse(context, value) {
    if (typeof value !== "number" || Number.isNaN(value)) {
      context.addIssue({
        code: "invalid_type",
        expected: "number",
        received: getType(value),
        message: `Expected number, received ${getType(value)}`,
      });

      return value;
    }

    for (const check of this.checks) {
      if (!check.validate(value)) {
        context.addIssue({
          code: check.code,
          message: check.message,
          ...check.metadata,
        });
      }
    }

    return value;
  }

  min(value, message) {
    return this._addCheck({
      code: "too_small",
      validate: (input) => input >= value,
      message: message ?? `Number must be greater than or equal to ${value}`,
      metadata: {
        minimum: value,
        inclusive: true,
        type: "number",
      },
    });
  }

  max(value, message) {
    return this._addCheck({
      code: "too_big",
      validate: (input) => input <= value,
      message: message ?? `Number must be less than or equal to ${value}`,
      metadata: {
        maximum: value,
        inclusive: true,
        type: "number",
      },
    });
  }

  gt(value, message) {
    return this._addCheck({
      code: "too_small",
      validate: (input) => input > value,
      message: message ?? `Number must be greater than ${value}`,
      metadata: {
        minimum: value,
        inclusive: false,
        type: "number",
      },
    });
  }

  gte(value, message) {
    return this.min(value, message);
  }

  lt(value, message) {
    return this._addCheck({
      code: "too_big",
      validate: (input) => input < value,
      message: message ?? `Number must be less than ${value}`,
      metadata: {
        maximum: value,
        inclusive: false,
        type: "number",
      },
    });
  }

  lte(value, message) {
    return this.max(value, message);
  }

  int(message) {
    return this._addCheck({
      code: "invalid_type",
      validate: Number.isInteger,
      message: message ?? "Expected integer",
      metadata: {
        expected: "integer",
        received: "float",
      },
    });
  }

  positive(message) {
    return this.gt(0, message);
  }

  negative(message) {
    return this.lt(0, message);
  }

  nonnegative(message) {
    return this.gte(0, message);
  }

  nonpositive(message) {
    return this.lte(0, message);
  }

  finite(message) {
    return this._addCheck({
      code: "not_finite",
      validate: Number.isFinite,
      message: message ?? "Number must be finite",
    });
  }

  safe(message) {
    return this._addCheck({
      code: "unsafe_number",
      validate: Number.isSafeInteger,
      message: message ?? "Number must be a safe integer",
    });
  }

  multipleOf(value, message) {
    if (value === 0) {
      throw new Error("multipleOf() divisor cannot be zero.");
    }

    return this._addCheck({
      code: "not_multiple_of",
      validate: (input) => {
        const quotient = input / value;
        return Math.abs(quotient - Math.round(quotient)) < 1e-10;
      },
      message: message ?? `Number must be a multiple of ${value}`,
      metadata: {
        multipleOf: value,
      },
    });
  }
}

function getType(value) {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  return typeof value;
}