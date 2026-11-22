/**
 * Mint - Literal Schema
 *
 * Validates that input exactly matches a specified value.
 */

import { Schema } from "../core/Schema.js";

export class LiteralSchema extends Schema {
  constructor(expectedValue) {
    super({
      type: "literal",
      value: expectedValue,
    });

    this.expectedValue = expectedValue;
  }

  _parse(context, value) {
    if (!Object.is(value, this.expectedValue)) {
      context.addIssue({
        code: "invalid_literal",
        expected: this.expectedValue,
        received: value,
        message: `Expected ${formatValue(this.expectedValue)}`,
      });
    }

    return value;
  }
}

function formatValue(value) {
  if (typeof value === "string") {
    return JSON.stringify(value);
  }

  if (typeof value === "bigint") {
    return `${value}n`;
  }

  if (typeof value === "symbol") {
    return value.toString();
  }

  if (value === undefined) {
    return "undefined";
  }

  return String(value);
}