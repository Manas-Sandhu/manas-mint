/**
 * Mint - Special Schemas
 *
 * Schemas for null, undefined, void, any, unknown,
 * never, and symbol.
 */

import { Schema } from "../core/Schema.js";

/**
 * Accepts only null.
 */
export class NullSchema extends Schema {
  constructor() {
    super({ type: "null" });
  }

  _parse(context, value) {
    if (value !== null) {
      context.addIssue({
        code: "invalid_type",
        expected: "null",
        received: getType(value),
        message: `Expected null, received ${getType(value)}`,
      });
    }

    return value;
  }
}

/**
 * Accepts only undefined.
 */
export class UndefinedSchema extends Schema {
  constructor() {
    super({ type: "undefined" });
  }

  _parse(context, value) {
    if (value !== undefined) {
      context.addIssue({
        code: "invalid_type",
        expected: "undefined",
        received: getType(value),
        message: `Expected undefined, received ${getType(value)}`,
      });
    }

    return value;
  }
}

/**
 * Accepts undefined.
 * Similar to undefined schema but semantically represents void.
 */
export class VoidSchema extends Schema {
  constructor() {
    super({ type: "void" });
  }

  _parse(context, value) {
    if (value !== undefined) {
      context.addIssue({
        code: "invalid_type",
        expected: "void",
        received: getType(value),
        message: `Expected void, received ${getType(value)}`,
      });
    }

    return value;
  }
}

/**
 * Accepts every value without validation.
 */
export class AnySchema extends Schema {
  constructor() {
    super({ type: "any" });
  }

  _parse(context, value) {
    return value;
  }
}

/**
 * Accepts every value without validation.
 *
 * Unlike AnySchema, this is intended to represent
 * an unknown value requiring further narrowing.
 */
export class UnknownSchema extends Schema {
  constructor() {
    super({ type: "unknown" });
  }

  _parse(context, value) {
    return value;
  }
}

/**
 * Rejects every value.
 */
export class NeverSchema extends Schema {
  constructor() {
    super({ type: "never" });
  }

  _parse(context, value) {
    context.addIssue({
      code: "invalid_type",
      expected: "never",
      received: getType(value),
      message: "Expected never",
    });

    return value;
  }
}

/**
 * Accepts only symbols.
 */
export class SymbolSchema extends Schema {
  constructor() {
    super({ type: "symbol" });
  }

  _parse(context, value) {
    if (typeof value !== "symbol") {
      context.addIssue({
        code: "invalid_type",
        expected: "symbol",
        received: getType(value),
        message: `Expected symbol, received ${getType(value)}`,
      });
    }

    return value;
  }
}

function getType(value) {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? "invalid date" : "date";
  }

  return typeof value;
}