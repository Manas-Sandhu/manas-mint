import { describe, it, expect } from "vitest";
import mint from "../../src/index.js";

describe("Wrapper schemas", () => {
  it("optional accepts undefined", () => {
    expect(mint.string().optional().safeParse(undefined).success).toBe(true);
    expect(mint.string().optional().safeParse("hello").success).toBe(true);
  });

  it("nullable accepts null", () => {
    expect(mint.string().nullable().safeParse(null).success).toBe(true);
    expect(mint.string().nullable().safeParse("hello").success).toBe(true);
  });

  it("nullish accepts null and undefined", () => {
    const schema = mint.string().nullish();

    expect(schema.safeParse(null).success).toBe(true);
    expect(schema.safeParse(undefined).success).toBe(true);
  });

  it("default supplies a fallback", () => {
    expect(mint.string().default("Mint").parse(undefined)).toBe("Mint");
    expect(mint.string().default("Mint").parse("Hello")).toBe("Hello");
  });

  it("supports function defaults", () => {
    const schema = mint.number().default(() => 42);

    expect(schema.parse(undefined)).toBe(42);
  });

  it("refine validates custom conditions", () => {
    const schema = mint.number().refine((value) => value > 10);

    expect(schema.safeParse(11).success).toBe(true);
    expect(schema.safeParse(5).success).toBe(false);
  });

  it("transform modifies parsed output", () => {
    const schema = mint.string().transform((value) => value.length);

    expect(schema.parse("Mint")).toBe(4);
  });

  it("pipe validates transformed output", () => {
    const schema = mint.string()
      .transform((value) => value.length)
      .pipe(mint.number().min(3));

    expect(schema.safeParse("Mint").success).toBe(true);
    expect(schema.safeParse("Hi").success).toBe(false);
  });

  it("supports descriptions and metadata", () => {
    const schema = mint.string().describe("A username");

    expect(schema.description).toBe("A username");
  });

  it("supports safeParse success results", () => {
    const result = mint.string().safeParse("hello");

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data).toBe("hello");
    }
  });

  it("supports safeParse failure results", () => {
    const result = mint.string().safeParse(123);

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error).toBeInstanceOf(Error);
    }
  });
});