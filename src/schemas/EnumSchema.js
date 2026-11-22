/**
 * Mint - Enum Schema
 *
 * Validates that input belongs to a predefined set of values.
 */

import { Schema } from "../core/Schema.js";

export class EnumSchema extends Schema {
  constructor(values) {
    const normalizedValues = normalizeValues(values);

    if (normalizedValues.length === 0) {
      throw new Error("EnumSchema requires at least one allowed value.");
    }

    super({
      type: "enum",
      values: Object.freeze([...normalizedValues]),
    });

    this.values = Object.freeze([...normalizedValues]);
  }

  _parse(context, value) {
    if (!this.values.some((allowed) => Object.is(allowed, value))) {
      context.addIssue({
        code: "invalid_enum_value",
        options: this.values,
        received: value,
        message: `Invalid enum value. Expected one of: ${this.values.map(formatValue).join(", ")}`,
      });
    }

    return value;
  }
}

function normalizeValues(values) {
  if (Array.isArray(values)) {
    return [...new Set(values)];
  }

  if (values !== null && typeof values === "object") {
    return [...new Set(Object.values(values))];
  }

  throw new TypeError("EnumSchema expects an array or an object of values.");
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