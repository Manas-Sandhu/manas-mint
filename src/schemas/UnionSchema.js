/**
 * Mint - Union Schema
 *
 * A value must validate against at least one schema.
 */

import { Schema } from "../core/Schema.js";

export class UnionSchema extends Schema {
  constructor(schemas) {
    validateSchemas(schemas);

    super({
      type: "union",
      options: Object.freeze([...schemas]),
    });

    this.options = Object.freeze([...schemas]);
  }

  _parse(context, value) {
    const branchErrors = [];

    for (const schema of this.options) {
      const checkpoint = context.checkpoint();

      const parsedValue = schema._parse(context, value);

      if (isPromise(parsedValue)) {
        throw new Error(
          "Asynchronous union validation requires async parsing.",
        );
      }

      const issues = context.getIssuesSince(checkpoint);

      // A branch succeeds if it produces no issues.
      if (issues.length === 0) {
        return parsedValue;
      }

      // Preserve this branch's errors separately.
      branchErrors.push([...issues]);

      // Remove failed branch issues before trying another.
      context.issues.splice(checkpoint);
    }

    context.addIssue({
      code: "invalid_union",
      message: "Input does not match any union option.",
      unionErrors: branchErrors,
    });

    return value;
  }

  async _parseAsync(context, value) {
    const branchErrors = [];

    for (const schema of this.options) {
      const checkpoint = context.checkpoint();

      const parsedValue = await schema._parseAsync(context, value);

      const issues = context.getIssuesSince(checkpoint);

      // A branch succeeds if it produces no issues.
      if (issues.length === 0) {
        return parsedValue;
      }

      // Preserve this branch's errors separately.
      branchErrors.push([...issues]);

      // Remove failed branch issues before trying another.
      context.issues.splice(checkpoint);
    }

    context.addIssue({
      code: "invalid_union",
      message: "Input does not match any union option.",
      unionErrors: branchErrors,
    });

    return value;
  }
}

function validateSchemas(schemas) {
  if (!Array.isArray(schemas) || schemas.length === 0) {
    throw new TypeError("UnionSchema expects a non-empty array of schemas.");
  }

  for (const schema of schemas) {
    if (!schema || typeof schema._parse !== "function") {
      throw new TypeError("Union options must be valid schemas.");
    }
  }
}

function isPromise(value) {
  return (
    value !== null &&
    (typeof value === "object" || typeof value === "function") &&
    typeof value.then === "function"
  );
}