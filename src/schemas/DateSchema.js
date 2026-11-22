/**
 * Mint - Date Schema
 */

import { Schema } from "../core/Schema.js";

export class DateSchema extends Schema {
  constructor(checks = []) {
    super({ type: "date" });
    this.checks = [...checks];
  }

  _addCheck(check) {
    return new DateSchema([...this.checks, check]);
  }

  _parse(context, value) {
    if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
      context.addIssue({
        code: "invalid_type",
        expected: "date",
        received: getType(value),
        message: `Expected valid Date, received ${getType(value)}`,
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

  min(minimum, message) {
    const date = normalizeDate(minimum);

    if (!date) {
      throw new Error("date.min() requires a valid Date.");
    }

    return this._addCheck({
      code: "too_small",
      validate: (input) => input.getTime() >= date.getTime(),
      message:
        message ??
        `Date must be greater than or equal to ${date.toISOString()}`,
      metadata: {
        minimum: date,
        inclusive: true,
        type: "date",
      },
    });
  }

  max(maximum, message) {
    const date = normalizeDate(maximum);

    if (!date) {
      throw new Error("date.max() requires a valid Date.");
    }

    return this._addCheck({
      code: "too_big",
      validate: (input) => input.getTime() <= date.getTime(),
      message:
        message ?? `Date must be less than or equal to ${date.toISOString()}`,
      metadata: {
        maximum: date,
        inclusive: true,
        type: "date",
      },
    });
  }

  gt(minimum, message) {
    const date = normalizeDate(minimum);

    if (!date) {
      throw new Error("date.gt() requires a valid Date.");
    }

    return this._addCheck({
      code: "too_small",
      validate: (input) => input.getTime() > date.getTime(),
      message: message ?? `Date must be after ${date.toISOString()}`,
      metadata: {
        minimum: date,
        inclusive: false,
        type: "date",
      },
    });
  }

  lt(maximum, message) {
    const date = normalizeDate(maximum);

    if (!date) {
      throw new Error("date.lt() requires a valid Date.");
    }

    return this._addCheck({
      code: "too_big",
      validate: (input) => input.getTime() < date.getTime(),
      message: message ?? `Date must be before ${date.toISOString()}`,
      metadata: {
        maximum: date,
        inclusive: false,
        type: "date",
      },
    });
  }

  gte(minimum, message) {
    return this.min(minimum, message);
  }

  lte(maximum, message) {
    return this.max(maximum, message);
  }
}

function normalizeDate(value) {
  const date =
    value instanceof Date ? new Date(value.getTime()) : new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
}

function getType(value) {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? "invalid date" : "date";
  }
  return typeof value;
}