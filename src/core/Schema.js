/**
 * Mint - Schema Validation Library
 * Core schema abstraction and schema wrappers.
 */

import { MintError } from "../errors/MintError.js";
import { ParseContext } from "./ParseContext.js";

export class Schema {
  constructor(definition = {}) {
    this._def = Object.freeze({ ...definition });
  }

  _parse(context, value) {
    throw new Error(
      `${this.constructor.name} must implement _parse().`
    );
  }

  /**
   * Async parsing hook.
   * Schemas without async behavior can reuse their synchronous parser.
   */
  async _parseAsync(context, value) {
    return this._parse(context, value);
  }

  parse(value) {
    const context = new ParseContext({ data: value });
    const result = this._parse(context, value);

    if (isPromise(result)) {
      throw new Error(
        "Asynchronous validation detected. Use parseAsync() instead."
      );
    }

    if (context.hasIssues) {
      throw new MintError(context.issues);
    }

    return result;
  }

  safeParse(value) {
    try {
      const context = new ParseContext({ data: value });
      const result = this._parse(context, value);

      if (isPromise(result)) {
        throw new Error(
          "Asynchronous validation detected. Use safeParseAsync() instead."
        );
      }

      if (context.hasIssues) {
        return {
          success: false,
          error: new MintError(context.issues),
        };
      }

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      if (error instanceof MintError) {
        return {
          success: false,
          error,
        };
      }

      throw error;
    }
  }

  async parseAsync(value) {
    const context = new ParseContext({ data: value });
    const result = await this._parseAsync(context, value);

    if (context.hasIssues) {
      throw new MintError(context.issues);
    }

    return result;
  }

  async safeParseAsync(value) {
    try {
      const context = new ParseContext({ data: value });
      const result = await this._parseAsync(context, value);

      if (context.hasIssues) {
        return {
          success: false,
          error: new MintError(context.issues),
        };
      }

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      if (error instanceof MintError) {
        return {
          success: false,
          error,
        };
      }

      throw error;
    }
  }

  optional() {
    return new OptionalSchema(this);
  }

  nullable() {
    return new NullableSchema(this);
  }

  nullish() {
    return this.nullable().optional();
  }

  default(value) {
    return new DefaultSchema(this, value);
  }

  refine(predicate, options = {}) {
    return new RefinementSchema(this, predicate, options);
  }

  transform(transformer) {
    return new TransformSchema(this, transformer);
  }

  pipe(schema) {
    return new PipeSchema(this, schema);
  }

  describe(description) {
    return new MetadataSchema(this, { description });
  }

  meta(metadata = {}) {
    return new MetadataSchema(this, metadata);
  }

  get description() {
    return this._def.description;
  }

  get metadata() {
    return this._def.metadata ?? {};
  }

  get type() {
    return this._def.type ?? "unknown";
  }
}

/* ================================================
   Wrapper Schemas
================================================ */

/**
 * Accepts undefined.
 */
export class OptionalSchema extends Schema {
  constructor(schema) {
    super({
      type: "optional",
      innerType: schema,
    });

    this.schema = schema;
  }

  _parse(context, value) {
    if (value === undefined) {
      return undefined;
    }

    return this.schema._parse(context, value);
  }

  async _parseAsync(context, value) {
    if (value === undefined) {
      return undefined;
    }

    return this.schema._parseAsync(context, value);
  }
}

/**
 * Accepts null.
 */
export class NullableSchema extends Schema {
  constructor(schema) {
    super({
      type: "nullable",
      innerType: schema,
    });

    this.schema = schema;
  }

  _parse(context, value) {
    if (value === null) {
      return null;
    }

    return this.schema._parse(context, value);
  }

  async _parseAsync(context, value) {
    if (value === null) {
      return null;
    }

    return this.schema._parseAsync(context, value);
  }
}

/**
 * Applies a fallback for undefined input.
 */
export class DefaultSchema extends Schema {
  constructor(schema, defaultValue) {
    super({
      type: "default",
      innerType: schema,
      defaultValue,
    });

    this.schema = schema;
    this.defaultValue = defaultValue;
  }

  _getDefault() {
    return typeof this.defaultValue === "function"
      ? this.defaultValue()
      : this.defaultValue;
  }

  _parse(context, value) {
    const resolvedValue =
      value === undefined
        ? this._getDefault()
        : value;

    return this.schema._parse(context, resolvedValue);
  }

  async _parseAsync(context, value) {
    const resolvedValue =
      value === undefined
        ? this._getDefault()
        : value;

    return this.schema._parseAsync(context, resolvedValue);
  }
}

/**
 * Adds custom validation.
 */
export class RefinementSchema extends Schema {
  constructor(schema, predicate, options = {}) {
    super({
      type: "refinement",
      innerType: schema,
      options,
    });

    this.schema = schema;
    this.predicate = predicate;
    this.options = options;
  }

  _parse(context, value) {
    const checkpoint = context.checkpoint();
    const parsedValue = this.schema._parse(context, value);

    if (isPromise(parsedValue)) {
      throw new Error(
        "Asynchronous refinement detected. Use parseAsync()."
      );
    }

    if (context.hasIssuesSince(checkpoint)) {
      return parsedValue;
    }

    const valid = this.predicate(parsedValue);

    if (isPromise(valid)) {
      throw new Error(
        "Asynchronous refinement detected. Use parseAsync()."
      );
    }

    if (!valid) {
      context.addIssue({
        code: this.options.code ?? "custom",
        message:
          this.options.message ??
          "Custom validation failed",
        path: this.options.path
          ? [...context.path, ...this.options.path]
          : context.path,
      });
    }

    return parsedValue;
  }

  async _parseAsync(context, value) {
    const checkpoint = context.checkpoint();

    const parsedValue = await this.schema._parseAsync(
      context,
      value
    );

    if (context.hasIssuesSince(checkpoint)) {
      return parsedValue;
    }

    const valid = await this.predicate(parsedValue);

    if (!valid) {
      context.addIssue({
        code: this.options.code ?? "custom",
        message:
          this.options.message ??
          "Custom validation failed",
        path: this.options.path
          ? [...context.path, ...this.options.path]
          : context.path,
      });
    }

    return parsedValue;
  }
}

/**
 * Transforms validated data.
 */
export class TransformSchema extends Schema {
  constructor(schema, transformer) {
    super({
      type: "transform",
      innerType: schema,
    });

    this.schema = schema;
    this.transformer = transformer;
  }

  _parse(context, value) {
    const checkpoint = context.checkpoint();
    const parsedValue = this.schema._parse(context, value);

    if (isPromise(parsedValue)) {
      throw new Error(
        "Asynchronous transformation detected. Use parseAsync()."
      );
    }

    if (context.hasIssuesSince(checkpoint)) {
      return parsedValue;
    }

    const transformedValue = this.transformer(parsedValue);

    if (isPromise(transformedValue)) {
      throw new Error(
        "Asynchronous transformation detected. Use parseAsync()."
      );
    }

    return transformedValue;
  }

  async _parseAsync(context, value) {
    const checkpoint = context.checkpoint();

    const parsedValue = await this.schema._parseAsync(
      context,
      value
    );

    if (context.hasIssuesSince(checkpoint)) {
      return parsedValue;
    }

    return await this.transformer(parsedValue);
  }
}

/**
 * Pipes output into another schema.
 */
export class PipeSchema extends Schema {
  constructor(firstSchema, secondSchema) {
    super({
      type: "pipe",
      inputType: firstSchema,
      outputType: secondSchema,
    });

    this.firstSchema = firstSchema;
    this.secondSchema = secondSchema;
  }

  _parse(context, value) {
    const checkpoint = context.checkpoint();

    const intermediateValue = this.firstSchema._parse(
      context,
      value
    );

    if (isPromise(intermediateValue)) {
      throw new Error(
        "Asynchronous piping detected. Use parseAsync()."
      );
    }

    if (context.hasIssuesSince(checkpoint)) {
      return intermediateValue;
    }

    return this.secondSchema._parse(
      context,
      intermediateValue
    );
  }

  async _parseAsync(context, value) {
    const checkpoint = context.checkpoint();

    const intermediateValue = await this.firstSchema._parseAsync(
      context,
      value
    );

    if (context.hasIssuesSince(checkpoint)) {
      return intermediateValue;
    }

    return this.secondSchema._parseAsync(
      context,
      intermediateValue
    );
  }
}

/**
 * Adds metadata to schemas.
 */
export class MetadataSchema extends Schema {
  constructor(schema, metadata = {}) {
    const mergedMetadata = {
      ...schema.metadata,
      ...metadata,
    };

    super({
      type: "metadata",
      innerType: schema,
      metadata: mergedMetadata,
      description:
        metadata.description ??
        schema.description,
    });

    this.schema = schema;
    this._metadata = Object.freeze(mergedMetadata);
  }

  _parse(context, value) {
    return this.schema._parse(context, value);
  }

  async _parseAsync(context, value) {
    return this.schema._parseAsync(context, value);
  }

  get description() {
    return this._def.description;
  }

  get metadata() {
    return this._metadata;
  }
}

function isPromise(value) {
  return (
    value !== null &&
    (typeof value === "object" || typeof value === "function") &&
    typeof value.then === "function"
  );
}