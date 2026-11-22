import { describe, it, expect } from "vitest";
import mint from "../../src/index.js";

describe("Composite schemas", () => {
  describe("Tuple", () => {
    it("validates positional types", () => {
      const schema = mint.tuple([mint.string(), mint.number()]);

      expect(schema.safeParse(["hello", 1]).success).toBe(true);
      expect(schema.safeParse([1, "hello"]).success).toBe(false);
    });

    it("rejects incorrect tuple lengths", () => {
      const schema = mint.tuple([mint.string(), mint.number()]);

      expect(schema.safeParse(["hello"]).success).toBe(false);
      expect(schema.safeParse(["hello", 1, true]).success).toBe(false);
    });

    it("supports rest schemas", () => {
      const schema = mint.tuple([mint.string()]).rest(mint.number());

      expect(schema.safeParse(["hello", 1, 2]).success).toBe(true);
      expect(schema.safeParse(["hello", 1, "bad"]).success).toBe(false);
    });
  });

  describe("Record", () => {
    it("validates record values", () => {
      const schema = mint.record(mint.number());

      expect(
        schema.safeParse({
          a: 1,
          b: 2,
        }).success,
      ).toBe(true);

      expect(
        schema.safeParse({
          a: 1,
          b: "bad",
        }).success,
      ).toBe(false);
    });

    it("validates record keys", () => {
      const schema = mint.record(mint.number(), mint.string().min(2));

      expect(
        schema.safeParse({
          aa: 1,
          bb: 2,
        }).success,
      ).toBe(true);

      expect(
        schema.safeParse({
          a: 1,
        }).success,
      ).toBe(false);
    });
  });

  describe("Union", () => {
    it("accepts a matching option", () => {
      const schema = mint.union([mint.string(), mint.number()]);

      expect(schema.safeParse("hello").success).toBe(true);
      expect(schema.safeParse(42).success).toBe(true);
    });

    it("rejects values matching no option", () => {
      const schema = mint.union([mint.string(), mint.number()]);

      expect(schema.safeParse(true).success).toBe(false);
    });
  });

  describe("Intersection", () => {
    it("combines compatible object schemas", () => {
      const schema = mint.intersection(
        mint.object({ name: mint.string() }),
        mint.object({ age: mint.number() }),
      );

      expect(
        schema.parse({
          name: "Mint",
          age: 1,
        }),
      ).toEqual({
        name: "Mint",
        age: 1,
      });
    });

    it("rejects values failing either schema", () => {
      const schema = mint.intersection(
        mint.object({ name: mint.string() }),
        mint.object({ age: mint.number() }),
      );

      expect(
        schema.safeParse({
          name: "Mint",
          age: "wrong",
        }).success,
      ).toBe(false);
    });
  });

  describe("Tuple edge cases", () => {
    it("rejects non-array input", () => {
      expect(mint.tuple([mint.string()]).safeParse("hello").success).toBe(
        false,
      );
      expect(mint.tuple([mint.string()]).safeParse(null).success).toBe(false);
    });

    it("throws when tuple schemas are invalid", () => {
      expect(() => mint.tuple("not an array")).toThrow(TypeError);
      expect(() => mint.tuple([null])).toThrow(TypeError);
    });

    it("validates rest schema construction", () => {
      expect(() => mint.tuple([mint.string()]).rest(null)).toThrow(TypeError);
    });

    it("preserves valid values when tuple has no schema for extra positions", () => {
      const result = mint.tuple([mint.string()]).safeParse(["hello"]);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(["hello"]);
    });

    it("collects multiple tuple validation issues", () => {
      const result = mint
        .tuple([mint.string(), mint.number()])
        .safeParse([1, "bad"]);

      expect(result.success).toBe(false);
      expect(result.error.issues.length).toBeGreaterThan(0);
    });
  });

  describe("Record edge cases", () => {
    it("rejects non-plain-object inputs", () => {
      const schema = mint.record(mint.number());

      expect(schema.safeParse(null).success).toBe(false);
      expect(schema.safeParse([]).success).toBe(false);
      expect(schema.safeParse(new Map()).success).toBe(false);
    });

    it("throws when value schema is invalid", () => {
      expect(() => mint.record(null)).toThrow(TypeError);
    });

    it("uses the default key schema when none is provided", () => {
      const schema = mint.record(mint.number(), null);
      expect(schema.safeParse({ a: 1 }).success).toBe(true);
    });

    it("returns an empty object for an empty record", () => {
      expect(mint.record(mint.number()).parse({})).toEqual({});
    });

    it("skips values whose keys fail validation", () => {
      const schema = mint.record(mint.number(), mint.string().min(2));

      const result = schema.safeParse({
        a: 1,
        valid: 2,
      });

      expect(result.success).toBe(false);
    });

    it("collects multiple record value errors", () => {
      const result = mint.record(mint.number()).safeParse({
        a: "bad",
        b: "also bad",
      });

      expect(result.success).toBe(false);
      expect(result.error.issues.length).toBeGreaterThan(1);
    });
  });
});