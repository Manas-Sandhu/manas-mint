import { describe, it, expect } from "vitest";
import mint from "../../src/index.js";

describe("ObjectSchema", () => {
  const schema = mint.object({
    name: mint.string(),
    age: mint.number(),
  });

  it("accepts valid objects", () => {
    expect(schema.safeParse({ name: "Mint", age: 1 }).success).toBe(true);
  });

  it("rejects non-objects", () => {
    expect(schema.safeParse(null).success).toBe(false);
    expect(schema.safeParse([]).success).toBe(false);
  });

  it("strips unknown keys by default", () => {
    expect(
      schema.parse({
        name: "Mint",
        age: 1,
        extra: true,
      }),
    ).toEqual({
      name: "Mint",
      age: 1,
    });
  });

  it("rejects unknown keys in strict mode", () => {
    expect(
      schema.strict().safeParse({
        name: "Mint",
        age: 1,
        extra: true,
      }).success,
    ).toBe(false);
  });

  it("preserves unknown keys in passthrough mode", () => {
    expect(
      schema.passthrough().parse({
        name: "Mint",
        age: 1,
        extra: true,
      }),
    ).toEqual({
      name: "Mint",
      age: 1,
      extra: true,
    });
  });

  it("supports extend", () => {
    const extended = schema.extend({
      email: mint.string().email(),
    });

    expect(
      extended.safeParse({
        name: "Mint",
        age: 1,
        email: "mint@example.com",
      }).success,
    ).toBe(true);
  });

  it("supports pick", () => {
    const picked = schema.pick(["name"]);

    expect(picked.parse({ name: "Mint", age: 1 })).toEqual({
      name: "Mint",
    });
  });

  it("supports omit", () => {
    const omitted = schema.omit(["age"]);

    expect(omitted.parse({ name: "Mint", age: 1 })).toEqual({
      name: "Mint",
    });
  });

  it("supports partial", () => {
    expect(schema.partial().safeParse({}).success).toBe(true);
  });

  it("supports required", () => {
    expect(schema.partial().required().safeParse({}).success).toBe(false);
  });

  it("supports merge", () => {
    const merged = schema.merge(
      mint.object({
        email: mint.string(),
      }),
    );

    expect(
      merged.safeParse({
        name: "Mint",
        age: 1,
        email: "mint",
      }).success,
    ).toBe(true);
  });

  it("validates nested object paths", () => {
    const nested = mint.object({
      user: mint.object({
        age: mint.number(),
      }),
    });

    const result = nested.safeParse({
      user: {
        age: "wrong",
      },
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(["user", "age"]);
    }
  });

  it("exposes shape and keys", () => {
    expect(schema.keys).toEqual(["name", "age"]);
    expect(schema.getShape()).toHaveProperty("name");
  });

  it("supports object selection using boolean objects", () => {
    expect(
      schema.pick({ name: true }).parse({
        name: "Mint",
        age: 1,
      }),
    ).toEqual({
      name: "Mint",
    });

    expect(
      schema.omit({ age: true }).parse({
        name: "Mint",
        age: 1,
      }),
    ).toEqual({
      name: "Mint",
    });
  });

  it("supports partial selection", () => {
    const partiallyOptional = schema.partial(["name"]);

    expect(partiallyOptional.safeParse({ age: 1 }).success).toBe(true);
    expect(partiallyOptional.safeParse({}).success).toBe(false);
  });

  it("supports required selection", () => {
    const partiallyOptional = schema.partial();

    expect(
      partiallyOptional.required(["name"]).safeParse({
        name: "Mint",
      }).success,
    ).toBe(true);

    expect(partiallyOptional.required(["name"]).safeParse({}).success).toBe(
      false,
    );
  });

  it("supports safeExtend", () => {
    const extended = schema.safeExtend({
      email: mint.string(),
    });

    expect(
      extended.safeParse({
        name: "Mint",
        age: 1,
        email: "mint@example.com",
      }).success,
    ).toBe(true);
  });

  it("throws when extending with an invalid shape", () => {
    expect(() => schema.extend(null)).toThrow(TypeError);
    expect(() => schema.extend({ invalid: null })).toThrow(TypeError);
  });

  it("throws when pick or omit receives invalid keys", () => {
    expect(() => schema.pick("name")).toThrow(TypeError);
    expect(() => schema.omit("age")).toThrow(TypeError);
  });

  it("throws when merge receives a non-object schema", () => {
    expect(() => schema.merge(mint.string())).toThrow(TypeError);
  });

  it("throws when object is constructed with an invalid shape", () => {
    expect(() => mint.object(null)).toThrow(TypeError);
    expect(() => mint.object([])).toThrow(TypeError);
    expect(() => mint.object({ name: null })).toThrow(TypeError);
  });

  it("throws when invalid unknown key mode is supplied", () => {
    expect(
      () => new schema.constructor({ name: mint.string() }, "invalid"),
    ).toThrow(TypeError);
  });

  it("preserves explicitly provided undefined values", () => {
    const optionalSchema = mint.object({
      name: mint.string().optional(),
    });

    expect(optionalSchema.parse({ name: undefined })).toEqual({
      name: undefined,
    });

    expect(optionalSchema.parse({})).toEqual({});
  });

  it("supports strip mode explicitly", () => {
    expect(
      schema.strip().parse({
        name: "Mint",
        age: 1,
        extra: true,
      }),
    ).toEqual({
      name: "Mint",
      age: 1,
    });
  });

  it("returns a copy of the shape", () => {
    const shape = schema.getShape();

    delete shape.name;

    expect(schema.keys).toEqual(["name", "age"]);
  });
});