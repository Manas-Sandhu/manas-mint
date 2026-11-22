/**
 * Mint - Function Schema
 *
 * Validates callable functions.
 * Optionally validates arguments and return values.
 */

import { Schema } from "../core/Schema.js";
import { TupleSchema } from "./TupleSchema.js";

export class FunctionSchema extends Schema {
  constructor(argsSchema = null, returnSchema = null) {
    super({
      type: "function",
      argsSchema,
      returnSchema,
    });

    this.argsSchema = argsSchema;
    this.returnSchema = returnSchema;
  }

  _parse(context, value) {
    if (typeof value !== "function") {
      context.addIssue({
        code: "invalid_type",
        expected: "function",
        received: typeof value,
        message: `Expected function, received ${typeof value}`,
      });

      return value;
    }

    if (!this.argsSchema && !this.returnSchema) {
      return value;
    }

    const originalFunction = value;
    const argsSchema = this.argsSchema;
    const returnSchema = this.returnSchema;

    return function validatedFunction(...args) {
      let validatedArgs = args;

      if (argsSchema) {
        validatedArgs = argsSchema.parse(args);
      }

      const result = originalFunction.apply(this, validatedArgs);

      if (!returnSchema) {
        return result;
      }

      // Support async function return validation.
      if (isPromise(result)) {
        return result.then((resolvedValue) =>
          returnSchema.parseAsync(resolvedValue),
        );
      }

      return returnSchema.parse(result);
    };
  }

  /**
   * Validate function arguments.
   */
  args(...schemas) {
    return new FunctionSchema(new TupleSchema(schemas), this.returnSchema);
  }

  /**
   * Validate function return values.
   */
  returns(schema) {
    validateSchema(schema);

    return new FunctionSchema(this.argsSchema, schema);
  }
}

function validateSchema(schema) {
  if (!schema || typeof schema._parse !== "function") {
    throw new TypeError("Function return schema must be valid.");
  }
}

function isPromise(value) {
  return (
    value !== null &&
    (typeof value === "object" || typeof value === "function") &&
    typeof value.then === "function"
  );
}