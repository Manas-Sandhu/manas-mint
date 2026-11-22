import { describe, it, expect } from "vitest";
import mint from "../../src/index.js";

describe("LiteralSchema edge cases", () => {
  it("distinguishes zero and negative zero", () => {
    expect(mint.literal(0).safeParse(-0).success).toBe(false);
  });

  it("accepts NaN as a literal", () => {
    expect(mint.literal(NaN).safeParse(NaN).success).toBe(true);
  });

  it("validates boolean literals", () => {
    expect(mint.literal(true).safeParse(true).success).toBe(true);
    expect(mint.literal(true).safeParse(false).success).toBe(false);
  });

  it("validates null literals", () => {
    expect(mint.literal(null).safeParse(null).success).toBe(true);
  });
});

describe("EnumSchema edge cases", () => {
  it("supports object-based enums", () => {
    const schema = mint.enum({
      Admin: "admin",
      User: "user",
    });

    expect(schema.safeParse("admin").success).toBe(true);
    expect(schema.safeParse("user").success).toBe(true);
    expect(schema.safeParse("guest").success).toBe(false);
  });

  it("handles duplicate values", () => {
    const schema = mint.enum(["a", "b", "a"]);

    expect(schema.safeParse("a").success).toBe(true);
    expect(schema.safeParse("b").success).toBe(true);
  });

  it("rejects empty enum definitions", () => {
    expect(() => mint.enum([])).toThrow();
  });

  it("rejects invalid enum definitions", () => {
    expect(() => mint.enum(null)).toThrow();
  });
});

describe("BigIntSchema edge cases", () => {
  it("supports greater-than and less-than", () => {
    expect(mint.bigint().gt(5n).safeParse(6n).success).toBe(true);
    expect(mint.bigint().gt(5n).safeParse(5n).success).toBe(false);

    expect(mint.bigint().lt(5n).safeParse(4n).success).toBe(true);
    expect(mint.bigint().lt(5n).safeParse(5n).success).toBe(false);
  });

  it("supports inclusive comparisons", () => {
    expect(mint.bigint().gte(5n).safeParse(5n).success).toBe(true);
    expect(mint.bigint().lte(5n).safeParse(5n).success).toBe(true);
  });

  it("supports multipleOf", () => {
    expect(mint.bigint().multipleOf(3n).safeParse(9n).success).toBe(true);
    expect(mint.bigint().multipleOf(3n).safeParse(10n).success).toBe(false);
  });

  it("rejects invalid bigint constraint values", () => {
    expect(() => mint.bigint().multipleOf(0n)).toThrow();
  });
});

describe("UnionSchema edge cases", () => {
  it("supports a union of literals", () => {
    const schema = mint.union([
      mint.literal("a"),
      mint.literal("b"),
      mint.literal("c"),
    ]);

    expect(schema.safeParse("b").success).toBe(true);
    expect(schema.safeParse("d").success).toBe(false);
  });

  it("does not leak failed branch issues when another branch succeeds", () => {
    const schema = mint.union([
      mint.string().min(5),
      mint.number(),
    ]);

    const result = schema.safeParse(10);

    expect(result.success).toBe(true);
  });

  it("rejects an empty union", () => {
    expect(() => mint.union([])).toThrow();
  });
});

describe("IntersectionSchema edge cases", () => {
  it("merges nested object outputs", () => {
    const schema = mint.intersection(
      mint.object({
        nested: mint.object({
          a: mint.number(),
        }),
      }),
      mint.object({
        nested: mint.object({
          b: mint.string(),
        }),
      })
    );

    expect(schema.parse({
      nested: {
        a: 1,
        b: "two",
      },
    })).toEqual({
      nested: {
        a: 1,
        b: "two",
      },
    });
  });

  it("merges compatible arrays", () => {
    const schema = mint.intersection(
      mint.array(mint.number()),
      mint.array(mint.number())
    );

    expect(schema.parse([1, 2])).toEqual([1, 2]);
  });

  it("rejects incompatible intersection outputs", () => {
    const schema = mint.intersection(
      mint.string(),
      mint.number()
    );

    expect(schema.safeParse("hello").success).toBe(false);
  });
});