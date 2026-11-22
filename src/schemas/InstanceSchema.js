/**
 * Mint - Instance Schema
 *
 * Validates instances of a specified constructor.
 */

import { Schema } from "../core/Schema.js";

export class InstanceSchema extends Schema {
  constructor(constructor) {
    validateConstructor(constructor);

    super({
      type: "instance",
      constructor,
    });

    this.constructorType = constructor;
  }

  _parse(context, value) {
    if (!(value instanceof this.constructorType)) {
      context.addIssue({
        code: "invalid_type",
        expected: this.constructorType.name || "instance",
        received: getType(value),
        message: `Expected instance of ${
          this.constructorType.name || "specified class"
        }`,
      });

      return value;
    }

    return value;
  }
}

function validateConstructor(constructor) {
  if (typeof constructor !== "function" || !constructor.prototype) {
    throw new TypeError(
      "InstanceSchema expects a class or constructor function.",
    );
  }
}

function getType(value) {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";

  return typeof value;
}