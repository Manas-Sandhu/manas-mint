/**
 * Mint
 *
 * Elegant schema validation for JavaScript and TypeScript.
 *
 * Public API.
 */

import { StringSchema } from "./schemas/StringSchema.js";
import { NumberSchema } from "./schemas/NumberSchema.js";
import { BooleanSchema } from "./schemas/BooleanSchema.js";
import { BigIntSchema } from "./schemas/BigIntSchema.js";
import { DateSchema } from "./schemas/DateSchema.js";

import {
  NullSchema,
  UndefinedSchema,
  VoidSchema,
  AnySchema,
  UnknownSchema,
  NeverSchema,
  SymbolSchema,
} from "./schemas/SpecialSchemas.js";

import { LiteralSchema } from "./schemas/LiteralSchema.js";
import { EnumSchema } from "./schemas/EnumSchema.js";
import { ArraySchema } from "./schemas/ArraySchema.js";
import { ObjectSchema } from "./schemas/ObjectSchema.js";
import { TupleSchema } from "./schemas/TupleSchema.js";
import { RecordSchema } from "./schemas/RecordSchema.js";
import { UnionSchema } from "./schemas/UnionSchema.js";
import { IntersectionSchema } from "./schemas/IntersectionSchema.js";
import { SetSchema } from "./schemas/SetSchema.js";
import { MapSchema } from "./schemas/MapSchema.js";
import { PromiseSchema } from "./schemas/PromiseSchema.js";
import { FunctionSchema } from "./schemas/FunctionSchema.js";
import { InstanceSchema } from "./schemas/InstanceSchema.js";

/* ================================================
   Schema Factories
================================================ */

export const string = () => new StringSchema();

export const number = () => new NumberSchema();

export const boolean = () => new BooleanSchema();

export const bigint = () => new BigIntSchema();

export const date = () => new DateSchema();

export const nullType = () => new NullSchema();

export const undefinedType = () => new UndefinedSchema();

export const voidType = () => new VoidSchema();

export const any = () => new AnySchema();

export const unknown = () => new UnknownSchema();

export const never = () => new NeverSchema();

export const symbol = () => new SymbolSchema();

export const literal = (value) =>
  new LiteralSchema(value);

export const enumType = (values) =>
  new EnumSchema(values);

export const array = (schema) =>
  new ArraySchema(schema);

export const object = (shape) =>
  new ObjectSchema(shape);

export const tuple = (schemas) =>
  new TupleSchema(schemas);

export const record = (
  valueSchema,
  keySchema = null
) =>
  new RecordSchema(valueSchema, keySchema);

export const union = (schemas) =>
  new UnionSchema(schemas);

export const intersection = (
  leftSchema,
  rightSchema
) =>
  new IntersectionSchema(
    leftSchema,
    rightSchema
  );

export const set = (schema) =>
  new SetSchema(schema);

export const map = (
  keySchema,
  valueSchema
) =>
  new MapSchema(keySchema, valueSchema);

export const promise = (schema) =>
  new PromiseSchema(schema);

export const functionType = () =>
  new FunctionSchema();

export const instance = (constructor) =>
  new InstanceSchema(constructor);

/* ================================================
   Mint Namespace
================================================ */

export const mint = Object.freeze({
  string,
  number,
  boolean,
  bigint,
  date,

  null: nullType,
  undefined: undefinedType,
  void: voidType,

  any,
  unknown,
  never,
  symbol,

  literal,
  enum: enumType,

  array,
  object,
  tuple,
  record,

  union,
  intersection,

  set,
  map,

  promise,
  function: functionType,
  instance,
});

/* ================================================
   Public Exports
================================================ */

export {
  StringSchema,
  NumberSchema,
  BooleanSchema,
  BigIntSchema,
  DateSchema,

  NullSchema,
  UndefinedSchema,
  VoidSchema,
  AnySchema,
  UnknownSchema,
  NeverSchema,
  SymbolSchema,

  LiteralSchema,
  EnumSchema,
  ArraySchema,
  ObjectSchema,
  TupleSchema,
  RecordSchema,
  UnionSchema,
  IntersectionSchema,
  SetSchema,
  MapSchema,
  PromiseSchema,
  FunctionSchema,
  InstanceSchema,
};

export {
  Schema,
  OptionalSchema,
  NullableSchema,
  DefaultSchema,
  RefinementSchema,
  TransformSchema,
  PipeSchema,
  MetadataSchema,
} from "./core/index.js";

export {
  MintError,
  createIssue,
  formatIssue,
} from "./errors/index.js";

export default mint;