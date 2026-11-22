/**
 * Mint - Intersection Schema
 *
 * A value must satisfy both schemas.
 * Object outputs are combined.
 */

import { Schema } from "../core/Schema.js";

export class IntersectionSchema extends Schema {
  constructor(leftSchema, rightSchema) {
    validateSchema(leftSchema);
    validateSchema(rightSchema);

    super({
      type: "intersection",
      left: leftSchema,
      right: rightSchema,
    });

    this.leftSchema = leftSchema;
    this.rightSchema = rightSchema;
  }

  _parse(context, value) {
    const checkpoint = context.checkpoint();

    const leftValue = this.leftSchema._parse(context, value);

    if (isPromise(leftValue)) {
      throw new Error(
        "Asynchronous intersection validation requires async parsing.",
      );
    }

    const rightValue = this.rightSchema._parse(context, value);

    if (isPromise(rightValue)) {
      throw new Error(
        "Asynchronous intersection validation requires async parsing.",
      );
    }

    if (context.hasIssuesSince(checkpoint)) {
      return value;
    }

    const result = mergeValues(leftValue, rightValue);

    if (!result.success) {
      context.addIssue({
        code: "invalid_intersection_types",
        message: "Intersection results could not be combined.",
      });

      return value;
    }

    return result.data;
  }

  async _parseAsync(context, value) {
    const checkpoint = context.checkpoint();

    const leftValue = await this.leftSchema._parseAsync(
      context,
      value,
    );

    const rightValue = await this.rightSchema._parseAsync(
      context,
      value,
    );

    if (context.hasIssuesSince(checkpoint)) {
      return value;
    }

    const result = mergeValues(leftValue, rightValue);

    if (!result.success) {
      context.addIssue({
        code: "invalid_intersection_types",
        message: "Intersection results could not be combined.",
      });

      return value;
    }

    return result.data;
  }
}

function mergeValues(left, right) {
  if (Object.is(left, right)) {
    return {
      success: true,
      data: left,
    };
  }

  if (isPlainObject(left) && isPlainObject(right)) {
    const result = { ...left };

    for (const key of Object.keys(right)) {
      if (Object.prototype.hasOwnProperty.call(left, key)) {
        const merged = mergeValues(left[key], right[key]);

        if (!merged.success) {
          return merged;
        }

        result[key] = merged.data;
      } else {
        result[key] = right[key];
      }
    }

    return {
      success: true,
      data: result,
    };
  }

  if (
    Array.isArray(left) &&
    Array.isArray(right) &&
    left.length === right.length
  ) {
    const result = [];

    for (let index = 0; index < left.length; index++) {
      const merged = mergeValues(left[index], right[index]);

      if (!merged.success) {
        return merged;
      }

      result.push(merged.data);
    }

    return {
      success: true,
      data: result,
    };
  }

  return {
    success: false,
  };
}

function isPlainObject(value) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const prototype = Object.getPrototypeOf(value);

  return prototype === Object.prototype || prototype === null;
}

function validateSchema(schema) {
  if (!schema || typeof schema._parse !== "function") {
    throw new TypeError("Intersection requires valid schemas.");
  }
}

function isPromise(value) {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof value.then === "function"
  );
}