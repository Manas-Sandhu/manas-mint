import { describe, it, expect } from "vitest";
import mint from "../../src/index.js";
import { Schema } from "../../src/core/Schema.js";

describe("Schema base class", () => {
  it("throws when base _parse is not implemented", () => {
    const schema = new Schema();

    expect(() => schema.parse("value")).toThrow("_parse()");
  });

  it("exposes schema definition and type", () => {
    const schema = new Schema({
      type: "custom",
      description: "Custom schema",
    });

    expect(schema.type).toBe("custom");
    expect(schema.description).toBe("Custom schema");
    expect(schema.metadata).toEqual({});
  });

  it("uses unknown as default type", () => {
    expect(new Schema().type).toBe("unknown");
  });

  it("supports parse and safeParse", () => {
    const schema = mint.string();

    expect(schema.parse("hello")).toBe("hello");
    expect(schema.safeParse("hello").success).toBe(true);

    const result = schema.safeParse(42);

    expect(result.success).toBe(false);
    expect(result.error).toBeInstanceOf(Error);
  });

  it("supports async parsing", async () => {
    const schema = mint.string();

    await expect(schema.parseAsync("hello")).resolves.toBe("hello");

    const result = await schema.safeParseAsync("hello");

    expect(result.success).toBe(true);
    expect(result.data).toBe("hello");
  });

  it("returns failure from safeParseAsync", async () => {
    const result = await mint.string().safeParseAsync(42);

    expect(result.success).toBe(false);
    expect(result.error.issues.length).toBeGreaterThan(0);
  });

  it("supports optional", () => {
    const schema = mint.string().optional();

    expect(schema.parse(undefined)).toBe(undefined);
    expect(schema.parse("hello")).toBe("hello");
  });

  it("supports nullable", () => {
    const schema = mint.string().nullable();

    expect(schema.parse(null)).toBe(null);
    expect(schema.parse("hello")).toBe("hello");
  });

  it("supports nullish", () => {
    const schema = mint.string().nullish();

    expect(schema.parse(null)).toBe(null);
    expect(schema.parse(undefined)).toBe(undefined);
  });

  it("supports static defaults", () => {
    expect(mint.string().default("Mint").parse(undefined)).toBe("Mint");
  });

  it("supports function defaults", () => {
    const schema = mint.number().default(() => 42);

    expect(schema.parse(undefined)).toBe(42);
  });

  it("supports refinement options", () => {
    const schema = mint.string().refine((value) => value.length > 2, {
      message: "Too short",
      code: "custom_error",
      path: ["name"],
    });

    const result = schema.safeParse("a");

    expect(result.success).toBe(false);
    expect(result.error.issues[0].message).toBe("Too short");
    expect(result.error.issues[0].code).toBe("custom_error");
    expect(result.error.issues[0].path).toContain("name");
  });

  it("does not run refinement when base validation fails", () => {
    let called = false;

    const schema = mint.string().refine(() => {
      called = true;
      return true;
    });

    expect(schema.safeParse(42).success).toBe(false);
    expect(called).toBe(false);
  });

  it("supports transforms", () => {
    expect(
      mint
        .string()
        .transform((value) => value.toUpperCase())
        .parse("mint"),
    ).toBe("MINT");
  });

  it("does not transform invalid input", () => {
    let called = false;

    const schema = mint.string().transform((value) => {
      called = true;
      return value;
    });

    expect(schema.safeParse(42).success).toBe(false);
    expect(called).toBe(false);
  });

  it("supports pipes", () => {
    const schema = mint
      .string()
      .transform((value) => value.trim())
      .pipe(mint.string().min(2));

    expect(schema.parse(" Mint ")).toBe("Mint");
  });

  it("does not execute the second pipe schema when the first fails", () => {
    const schema = mint.number().pipe(mint.string());

    expect(schema.safeParse("wrong").success).toBe(false);
  });

  it("supports describe", () => {
    const schema = mint.string().describe("Username");

    expect(schema.description).toBe("Username");
  });

  it("supports metadata", () => {
    const schema = mint.string().meta({
      description: "Username",
      custom: "value",
    });

    expect(schema.description).toBe("Username");
    expect(schema.metadata.custom).toBe("value");
  });

  it("merges metadata", () => {
    const schema = mint
      .string()
      .meta({
        first: true,
      })
      .meta({
        second: true,
      });

    expect(schema.metadata).toEqual({
      first: true,
      second: true,
    });
  });

  it("supports metadata async parsing", async () => {
    const schema = mint.string().meta({ tag: "test" });

    await expect(schema.parseAsync("hello")).resolves.toBe("hello");
  });

  it("supports async optional and nullable wrappers", async () => {
    await expect(mint.string().optional().parseAsync(undefined)).resolves.toBe(
      undefined,
    );

    await expect(mint.string().nullable().parseAsync(null)).resolves.toBe(null);
  });

  it("supports async default values", async () => {
    await expect(
      mint.string().default("Mint").parseAsync(undefined),
    ).resolves.toBe("Mint");
  });
});