/**
 * Mint - BigInt Schema
 */

import { Schema } from "../core/Schema.js";

export class BigIntSchema extends Schema {
  constructor(checks = []) {
    super({ type: "bigint" });
    this.checks = [...checks];
  }

  _addCheck(check) {
    return new BigIntSchema([...this.checks, check]);
  }

  _parse(context, value) {
    if (typeof value !== "bigint") {
      context.addIssue({
        code: "invalid_type",
        expected: "bigint",
        received: getType(value),
        message: `Expected bigint, received ${getType(value)}`,
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
      message: message ?? `BigInt must be greater than or equal to ${value}`,
      metadata: {
        minimum: value,
        inclusive: true,
        type: "bigint",
      },
    });
  }

  max(value, message) {
    return this._addCheck({
      code: "too_big",
      validate: (input) => input <= value,
      message: message ?? `BigInt must be less than or equal to ${value}`,
      metadata: {
        maximum: value,
        inclusive: true,
        type: "bigint",
      },
    });
  }

  gt(value, message) {
    return this._addCheck({
      code: "too_small",
      validate: (input) => input > value,
      message: message ?? `BigInt must be greater than ${value}`,
      metadata: {
        minimum: value,
        inclusive: false,
        type: "bigint",
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
      message: message ?? `BigInt must be less than ${value}`,
      metadata: {
        maximum: value,
        inclusive: false,
        type: "bigint",
      },
    });
  }

  lte(value, message) {
    return this.max(value, message);
  }

  positive(message) {
    return this.gt(0n, message);
  }

  negative(message) {
    return this.lt(0n, message);
  }

  nonnegative(message) {
    return this.gte(0n, message);
  }

  nonpositive(message) {
    return this.lte(0n, message);
  }

  multipleOf(value, message) {
    if (value === 0n) {
      throw new Error("multipleOf() divisor cannot be zero.");
    }

    return this._addCheck({
      code: "not_multiple_of",
      validate: (input) => input % value === 0n,
      message: message ?? `BigInt must be a multiple of ${value}`,
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