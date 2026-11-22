/**
 * Mint - Object Schema
 *
 * Validates objects using a defined schema shape.
 * Supports:
 * - Nested validation
 * - Strip unknown keys (default)
 * - Strict unknown-key rejection
 * - Passthrough unknown keys
 * - Pick / omit / extend / merge
 * - Partial / required
 * - Async validation
 */

import { Schema } from "../core/Schema.js";
import { isPlainObject, hasOwn } from "../utils/objectUtils.js";

export class ObjectSchema extends Schema {
  constructor(shape, unknownKeys = "strip") {
    validateShape(shape);
    validateUnknownKeysMode(unknownKeys);

    const frozenShape = Object.freeze({ ...shape });

    super({
      type: "object",
      shape: frozenShape,
      unknownKeys,
    });

    this.shape = frozenShape;
    this.unknownKeys = unknownKeys;
  }

  _parse(context, value) {
    if (!isPlainObject(value)) {
      context.addIssue({
        code: "invalid_type",
        expected: "object",
        received: getType(value),
        message: `Expected object, received ${getType(value)}`,
      });

      return value;
    }

    const output = {};

    // Validate known schema properties.
    for (const key of Object.keys(this.shape)) {
      const schema = this.shape[key];
      const exists = hasOwn(value, key);
      const inputValue = exists ? value[key] : undefined;

      const childContext = context.child(key, inputValue);

      const parsedValue = schema._parse(childContext, inputValue);

      if (isPromise(parsedValue)) {
        throw new Error(
          "Asynchronous object validation requires async parsing.",
        );
      }

      // Preserve explicitly present undefined values.
      // Omit absent optional properties.
      if (exists || parsedValue !== undefined) {
        output[key] = parsedValue;
      }
    }

    this._processUnknownKeys(context, value, output);

    return output;
  }

  async _parseAsync(context, value) {
    if (!isPlainObject(value)) {
      context.addIssue({
        code: "invalid_type",
        expected: "object",
        received: getType(value),
        message: `Expected object, received ${getType(value)}`,
      });

      return value;
    }

    const output = {};

    // Validate known schema properties asynchronously.
    // Sequential parsing preserves deterministic issue ordering.
    for (const key of Object.keys(this.shape)) {
      const schema = this.shape[key];
      const exists = hasOwn(value, key);
      const inputValue = exists ? value[key] : undefined;

      const childContext = context.child(key, inputValue);

      const parsedValue = await schema._parseAsync(childContext, inputValue);

      // Preserve explicitly present undefined values.
      // Omit absent optional properties.
      if (exists || parsedValue !== undefined) {
        output[key] = parsedValue;
      }
    }

    this._processUnknownKeys(context, value, output);

    return output;
  }

  _processUnknownKeys(context, value, output) {
    const unknownKeys = Object.keys(value).filter(
      (key) => !hasOwn(this.shape, key),
    );

    if (this.unknownKeys === "strict") {
      for (const key of unknownKeys) {
        context.child(key, value[key]).addIssue({
          code: "unrecognized_key",
          message: `Unrecognized key: "${key}"`,
          key,
        });
      }
    } else if (this.unknownKeys === "passthrough") {
      for (const key of unknownKeys) {
        output[key] = value[key];
      }
    }
  }

  /**
   * Reject all unknown object keys.
   */
  strict() {
    return new ObjectSchema(this.shape, "strict");
  }

  /**
   * Allow unknown keys and preserve them.
   */
  passthrough() {
    return new ObjectSchema(this.shape, "passthrough");
  }

  /**
   * Strip unknown keys.
   */
  strip() {
    return new ObjectSchema(this.shape, "strip");
  }

  /**
   * Add or replace fields.
   */
  extend(additionalShape) {
    validateShape(additionalShape);

    return new ObjectSchema(
      {
        ...this.shape,
        ...additionalShape,
      },
      this.unknownKeys,
    );
  }

  /**
   * Alias for extend().
   */
  safeExtend(additionalShape) {
    return this.extend(additionalShape);
  }

  /**
   * Select specified properties.
   */
  pick(keys) {
    const selectedShape = {};

    for (const key of normalizeKeys(keys)) {
      if (hasOwn(this.shape, key)) {
        selectedShape[key] = this.shape[key];
      }
    }

    return new ObjectSchema(selectedShape, this.unknownKeys);
  }

  /**
   * Exclude specified properties.
   */
  omit(keys) {
    const excluded = new Set(normalizeKeys(keys));
    const newShape = {};

    for (const key of Object.keys(this.shape)) {
      if (!excluded.has(key)) {
        newShape[key] = this.shape[key];
      }
    }

    return new ObjectSchema(newShape, this.unknownKeys);
  }

  /**
   * Make every field optional.
   */
  partial(keys) {
    const selected =
      keys === undefined ? Object.keys(this.shape) : normalizeKeys(keys);

    const selectedSet = new Set(selected);
    const newShape = {};

    for (const key of Object.keys(this.shape)) {
      newShape[key] = selectedSet.has(key)
        ? this.shape[key].optional()
        : this.shape[key];
    }

    return new ObjectSchema(newShape, this.unknownKeys);
  }

  /**
   * Make every field required.
   */
  required(keys) {
    const selected =
      keys === undefined ? Object.keys(this.shape) : normalizeKeys(keys);

    const selectedSet = new Set(selected);
    const newShape = {};

    for (const key of Object.keys(this.shape)) {
      newShape[key] = selectedSet.has(key)
        ? unwrapOptional(this.shape[key])
        : this.shape[key];
    }

    return new ObjectSchema(newShape, this.unknownKeys);
  }

  /**
   * Merge another ObjectSchema into this one.
   * The other schema's fields overwrite matching keys.
   */
  merge(other) {
    if (!(other instanceof ObjectSchema)) {
      throw new TypeError("merge() expects another ObjectSchema.");
    }

    return new ObjectSchema(
      {
        ...this.shape,
        ...other.shape,
      },
      other.unknownKeys,
    );
  }

  /**
   * Returns the shape definition.
   */
  getShape() {
    return { ...this.shape };
  }

  /**
   * Returns keys defined by this schema.
   */
  get keys() {
    return Object.keys(this.shape);
  }
}

function validateShape(shape) {
  if (shape === null || typeof shape !== "object" || Array.isArray(shape)) {
    throw new TypeError("ObjectSchema shape must be an object.");
  }

  for (const [key, schema] of Object.entries(shape)) {
    if (!schema || typeof schema._parse !== "function") {
      throw new TypeError(`Invalid schema for object key "${key}".`);
    }
  }
}

function validateUnknownKeysMode(mode) {
  const validModes = ["strip", "strict", "passthrough"];

  if (!validModes.includes(mode)) {
    throw new TypeError(`Invalid unknown-key mode "${mode}".`);
  }
}

function normalizeKeys(keys) {
  if (Array.isArray(keys)) {
    return keys;
  }

  if (keys && typeof keys === "object") {
    return Object.keys(keys).filter((key) => keys[key]);
  }

  throw new TypeError("Expected an array of keys or key-selection object.");
}

function unwrapOptional(schema) {
  if (schema.type === "optional") {
    return schema.schema;
  }

  if (schema.type === "default") {
    return schema.schema;
  }

  return schema;
}

function getType(value) {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";

  return typeof value;
}

function isPromise(value) {
  return (
    value !== null &&
    (typeof value === "object" || typeof value === "function") &&
    typeof value.then === "function"
  );
}