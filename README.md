# Mint

**A lightweight JavaScript schema validation library.**

Mint is a schema-based validation library for JavaScript that provides a simple, consistent way to validate, parse, and transform data. It supports primitive values, complex data structures, custom validation, asynchronous validation, and structured validation errors.

Define a schema once and use it to validate data wherever your application needs it.

---

## Features

- Simple, chainable schema API
- Validation for primitive types and complex data structures
- Object schemas with support for optional, partial, pick, omit, extend, and merge operations
- Array, tuple, record, union, and intersection schemas
- Set and Map validation
- Custom validation using refinements
- Data transformation
- Synchronous and asynchronous parsing
- Structured validation errors
- Safe parsing without throwing on validation failures
- JavaScript and ESM support

---

## Installation

```bash
npm install @manas/mint
```

## Quick Start

```javascript
import mint from "@manas/mint";

const userSchema = mint.object({
  name: mint.string().min(2),
  age: mint.number().min(18),
  email: mint.string().email(),
});

const result = userSchema.safeParse({
  name: "Manas",
  age: 21,
  email: "manas@example.com",
});

if (result.success) {
  console.log("Valid data:", result.data);
} else {
  console.log("Validation errors:", result.error.issues);
}
```

---

## Basic Validation

Mint provides schemas for common JavaScript data types.

```javascript
mint.string();
mint.number();
mint.boolean();
mint.bigint();
mint.date();

mint.null();
mint.undefined();
mint.void();

mint.any();
mint.unknown();
mint.never();
mint.symbol();
```

### String Validation

```javascript
const usernameSchema = mint.string().min(3).max(20);

usernameSchema.parse("manas"); // Valid
usernameSchema.parse("ab"); // Throws validation error
```

Email validation:

```javascript
const emailSchema = mint.string().email();

emailSchema.safeParse("hello@example.com"); // Success
emailSchema.safeParse("invalid-email"); // Failure
```

### Number Validation

```javascript
const ageSchema = mint.number().min(18).max(100);

ageSchema.safeParse(25); // Success
ageSchema.safeParse(15); // Failure
```

---

## Parsing and Validation

Mint provides two primary ways to validate data.

### `parse()`

Validates the input and returns the parsed value. Throws a validation error if the input is invalid.

```javascript
const schema = mint.string();

schema.parse("hello"); // "hello"
schema.parse(123); // Throws MintError
```

### `safeParse()`

Validates the input without throwing a validation error. Returns a result object.

```javascript
const schema = mint.number();

const result = schema.safeParse("hello");

if (result.success) {
  console.log(result.data);
} else {
  console.log(result.error);
}
```

Successful results:

```javascript
{
  success: true,
  data: 123
}
```

Failed results:

```javascript
{
  success: false,
  error: MintError
}
```

---

## Optional, Nullable, and Default Values

### Optional

Allows a value to be `undefined`.

```javascript
const schema = mint.string().optional();

schema.safeParse(undefined); // Success
schema.safeParse("hello"); // Success
```

### Nullable

Allows a value to be `null`.

```javascript
const schema = mint.string().nullable();

schema.safeParse(null); // Success
schema.safeParse("hello"); // Success
```

### Nullish

Allows both `null` and `undefined`.

```javascript
const schema = mint.string().nullish();
```

### Default Values

Provides a default value when the input is `undefined`.

```javascript
const schema = mint.string().default("Mint");

schema.parse(undefined); // "Mint"
```

---

## Object Schemas

Object schemas validate the structure and values of objects.

```javascript
const userSchema = mint.object({
  name: mint.string(),
  age: mint.number(),
  active: mint.boolean(),
});

userSchema.safeParse({
  name: "Manas",
  age: 20,
  active: true,
});
```

### Optional Properties

```javascript
const userSchema = mint.object({
  name: mint.string(),
  email: mint.string().optional(),
});
```

### Partial Objects

Makes object properties optional.

```javascript
const updateUserSchema = mint.object({
  name: mint.string(),
  age: mint.number(),
}).partial();
```

### Pick

Select specific properties from an object schema.

```javascript
const userSchema = mint.object({
  name: mint.string(),
  age: mint.number(),
  email: mint.string(),
});

const nameSchema = userSchema.pick(["name"]);
```

### Omit

Remove selected properties from an object schema.

```javascript
const publicUserSchema = mint.object({
  name: mint.string(),
  age: mint.number(),
  password: mint.string(),
}).omit(["password"]);
```

### Extend

Add properties to an existing object schema.

```javascript
const userSchema = mint.object({
  name: mint.string(),
});

const employeeSchema = userSchema.extend({
  department: mint.string(),
});
```

### Merge

Combine object schemas.

```javascript
const profileSchema = mint.object({
  name: mint.string(),
});

const settingsSchema = mint.object({
  active: mint.boolean(),
});

const combinedSchema = profileSchema.merge(settingsSchema);
```

---

## Arrays

Validate arrays and their elements.

```javascript
const tagsSchema = mint.array(mint.string());

tagsSchema.safeParse(["javascript", "validation", "mint"]);
```

Array constraints:

```javascript
const schema = mint.array(mint.number()).min(1).max(5);
```

---

## Tuples

Validate arrays with position-specific schemas.

```javascript
const schema = mint.tuple([
  mint.string(),
  mint.number(),
  mint.boolean(),
]);

schema.safeParse(["hello", 42, true]);
```

### Rest Elements

```javascript
const schema = mint.tuple([
  mint.string(),
  mint.number(),
]).rest(mint.boolean());

schema.safeParse(["hello", 42, true, false]);
```

---

## Records

Validate objects whose values share a schema.

```javascript
const scoresSchema = mint.record(mint.number());

scoresSchema.safeParse({
  math: 95,
  science: 88,
});
```

Records can also validate keys:

```javascript
const userRecordSchema = mint.record(
  mint.number(),
  mint.string().min(2),
);
```

---

## Unions

Accept data matching at least one schema.

```javascript
const schema = mint.union([
  mint.string(),
  mint.number(),
]);

schema.safeParse("hello"); // Success
schema.safeParse(42); // Success
schema.safeParse(true); // Failure
```

---

## Intersections

Combine validation requirements from multiple schemas.

```javascript
const nameSchema = mint.object({
  name: mint.string(),
});

const ageSchema = mint.object({
  age: mint.number(),
});

const userSchema = mint.intersection(
  nameSchema,
  ageSchema,
);

userSchema.safeParse({
  name: "Manas",
  age: 21,
});
```

---

## Enums and Literals

### Literal

Validate an exact value.

```javascript
const schema = mint.literal("mint");

schema.safeParse("mint"); // Success
schema.safeParse("other"); // Failure
```

### Enum

Validate against a fixed set of values.

```javascript
const roleSchema = mint.enum([
  "admin",
  "user",
  "guest",
]);

roleSchema.safeParse("admin"); // Success
roleSchema.safeParse("unknown"); // Failure
```

---

## Set and Map

### Set

```javascript
const schema = mint.set(mint.string()).min(1);

schema.safeParse(new Set(["mint", "javascript"]));
```

### Map

```javascript
const schema = mint.map(
  mint.string(),
  mint.number(),
);

schema.safeParse(
  new Map([
    ["math", 95],
    ["science", 88],
  ]),
);
```

---

## Custom Validation

Use `.refine()` to define custom validation rules.

```javascript
const passwordSchema = mint.string().refine(
  (password) => password.length >= 8,
);

passwordSchema.safeParse("strongpass"); // Success
passwordSchema.safeParse("short"); // Failure
```

Custom validation can also be used inside object schemas.

```javascript
const userSchema = mint.object({
  username: mint.string().refine(
    (value) => value.length >= 3,
  ),
});
```

---

## Transformations

Use `.transform()` to transform successfully parsed data.

```javascript
const schema = mint.string().transform(
  (value) => value.trim(),
);

schema.parse("  Mint  "); // "Mint"
```

Transforms can be combined with validation.

```javascript
const schema = mint.string()
  .transform((value) => value.trim())
  .pipe(mint.string().min(1));
```

---

## Asynchronous Validation

Mint supports asynchronous refinements and parsing.

```javascript
const usernameSchema = mint.string().refine(
  async (username) => {
    // Example asynchronous check
    return username.length >= 3;
  },
);
```

Use asynchronous parsing methods when schemas contain asynchronous validation.

### `parseAsync()`

```javascript
const result = await usernameSchema.parseAsync("manas");
```

### `safeParseAsync()`

```javascript
const result = await usernameSchema.safeParseAsync("manas");

if (result.success) {
  console.log(result.data);
} else {
  console.log(result.error.issues);
}
```

Asynchronous validation is also supported within composite schemas such as objects, arrays, tuples, records, unions, sets, and maps.

---

## Error Handling

Mint provides structured validation errors through `MintError`.

```javascript
const schema = mint.object({
  name: mint.string(),
  age: mint.number(),
});

const result = schema.safeParse({
  name: 123,
  age: "invalid",
});

if (!result.success) {
  console.log(result.error.issues);
}
```

Each issue contains information about the validation failure, including its type, message, and location within the input.

You can use these issues to build custom error messages, form feedback, or API responses.

---

## Available Schemas

| Schema | Description |
|---|---|
| `string()` | String validation |
| `number()` | Number validation |
| `boolean()` | Boolean validation |
| `bigint()` | BigInt validation |
| `date()` | Date validation |
| `null()` | Null values |
| `undefined()` | Undefined values |
| `void()` | Void values |
| `any()` | Any value |
| `unknown()` | Unknown values |
| `never()` | No valid values |
| `symbol()` | Symbol values |
| `literal()` | Exact values |
| `enum()` | Fixed set of values |
| `array()` | Arrays |
| `object()` | Objects |
| `tuple()` | Fixed-position arrays |
| `record()` | Key-value objects |
| `union()` | Multiple possible schemas |
| `intersection()` | Combined schemas |
| `set()` | Set collections |
| `map()` | Map collections |
| `promise()` | Promise validation |
| `function()` | Function validation |
| `instance()` | Class instance validation |

---

## Development

Clone the repository and install dependencies.

```bash
npm install
```

### Run Tests

```bash
npm test
```

### Watch Tests

```bash
npm run test:watch
```

### Generate Coverage

```bash
npm run coverage
```

### Syntax Check

```bash
npm run check
```

---

## Project Status

Mint is currently under active development.

Version: **0.1.0**

---

## License

Add your chosen license here before publishing the package.

---

Built with JavaScript.