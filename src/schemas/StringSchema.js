/**
 * Mint - String Schema
 */

import { Schema } from "../core/Schema.js";

const EMAIL_REGEX =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class StringSchema extends Schema {
  constructor(checks = []) {
    super({ type: "string" });
    this.checks = [...checks];
  }

  _addCheck(check) {
    return new StringSchema([
      ...this.checks,
      check,
    ]);
  }

  _parse(context, value) {
    if (typeof value !== "string") {
      context.addIssue({
        code: "invalid_type",
        expected: "string",
        received: getType(value),
        message: `Expected string, received ${getType(value)}`,
      });

      return value;
    }

    let parsed = value;

    for (const check of this.checks) {
      if (check.kind === "transform") {
        parsed = check.transform(parsed);
        continue;
      }

      const valid = check.validate(parsed);

      if (!valid) {
        context.addIssue({
          code: check.code,
          message: check.message,
          ...check.metadata,
        });
      }
    }

    return parsed;
  }

  min(value, message) {
    return this._addCheck({
      kind: "check",
      code: "too_small",
      validate: (input) => input.length >= value,
      message: message ?? `String must contain at least ${value} character(s)`,
      metadata: {
        minimum: value,
        inclusive: true,
        type: "string",
      },
    });
  }

  max(value, message) {
    return this._addCheck({
      kind: "check",
      code: "too_big",
      validate: (input) => input.length <= value,
      message: message ?? `String must contain at most ${value} character(s)`,
      metadata: {
        maximum: value,
        inclusive: true,
        type: "string",
      },
    });
  }

  length(value, message) {
    return this._addCheck({
      kind: "check",
      code: "invalid_length",
      validate: (input) => input.length === value,
      message: message ?? `String must contain exactly ${value} character(s)`,
      metadata: {
        length: value,
        type: "string",
      },
    });
  }

  regex(expression, message) {
    return this._addCheck({
      kind: "check",
      code: "invalid_string",
      validate: (input) => {
        expression.lastIndex = 0;
        return expression.test(input);
      },
      message: message ?? "Invalid string format",
      metadata: {
        validation: "regex",
      },
    });
  }

  email(message) {
    return this._addCheck({
      kind: "check",
      code: "invalid_string",
      validate: (input) => EMAIL_REGEX.test(input),
      message: message ?? "Invalid email address",
      metadata: {
        validation: "email",
      },
    });
  }

  url(message) {
    return this._addCheck({
      kind: "check",
      code: "invalid_string",
      validate: (input) => {
        try {
          const url = new URL(input);
          return Boolean(url.protocol && url.hostname);
        } catch {
          return false;
        }
      },
      message: message ?? "Invalid URL",
      metadata: {
        validation: "url",
      },
    });
  }

  uuid(message) {
    return this._addCheck({
      kind: "check",
      code: "invalid_string",
      validate: (input) =>
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(input),
      message: message ?? "Invalid UUID",
      metadata: {
        validation: "uuid",
      },
    });
  }

  startsWith(value, message) {
    return this._addCheck({
      kind: "check",
      code: "invalid_string",
      validate: (input) => input.startsWith(value),
      message: message ?? `String must start with "${value}"`,
      metadata: {
        validation: "startsWith",
        value,
      },
    });
  }

  endsWith(value, message) {
    return this._addCheck({
      kind: "check",
      code: "invalid_string",
      validate: (input) => input.endsWith(value),
      message: message ?? `String must end with "${value}"`,
      metadata: {
        validation: "endsWith",
        value,
      },
    });
  }

  includes(value, message) {
    return this._addCheck({
      kind: "check",
      code: "invalid_string",
      validate: (input) => input.includes(value),
      message: message ?? `String must contain "${value}"`,
      metadata: {
        validation: "includes",
        value,
      },
    });
  }

  trim() {
    return this._addCheck({
      kind: "transform",
      transform: (input) => input.trim(),
    });
  }

  lowercase() {
    return this._addCheck({
      kind: "transform",
      transform: (input) => input.toLowerCase(),
    });
  }

  uppercase() {
    return this._addCheck({
      kind: "transform",
      transform: (input) => input.toUpperCase(),
    });
  }
}

function getType(value) {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  return typeof value;
}