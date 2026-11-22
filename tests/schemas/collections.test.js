import { describe, it, expect } from "vitest";
import mint from "../../src/index.js";

describe("Native collection schemas", () => {
  describe("Set", () => {
    it("accepts valid Sets", () => {
      expect(
        mint.set(mint.number()).safeParse(new Set([1, 2, 3])).success,
      ).toBe(true);
    });

    it("rejects non-Sets", () => {
      expect(mint.set(mint.number()).safeParse([1, 2, 3]).success).toBe(false);
    });

    it("validates Set elements", () => {
      expect(
        mint.set(mint.number()).safeParse(new Set([1, "bad"])).success,
      ).toBe(false);
    });

    it("supports size constraints", () => {
      expect(
        mint
          .set(mint.string())
          .min(2)
          .safeParse(new Set(["a", "b"])).success,
      ).toBe(true);
      expect(
        mint
          .set(mint.string())
          .max(1)
          .safeParse(new Set(["a", "b"])).success,
      ).toBe(false);
      expect(
        mint.set(mint.string()).nonempty().safeParse(new Set()).success,
      ).toBe(false);
    });
  });

  describe("Map", () => {
    it("accepts valid Maps", () => {
      const schema = mint.map(mint.string(), mint.number());

      expect(
        schema.safeParse(
          new Map([
            ["a", 1],
            ["b", 2],
          ]),
        ).success,
      ).toBe(true);
    });

    it("rejects non-Maps", () => {
      expect(
        mint.map(mint.string(), mint.number()).safeParse({ a: 1 }).success,
      ).toBe(false);
    });

    it("validates keys and values", () => {
      const schema = mint.map(mint.string().min(2), mint.number());

      expect(schema.safeParse(new Map([["aa", 1]])).success).toBe(true);

      expect(schema.safeParse(new Map([["a", 1]])).success).toBe(false);
    });

    it("supports size constraints", () => {
      const schema = mint.map(mint.string(), mint.number());

      expect(schema.min(1).safeParse(new Map([["a", 1]])).success).toBe(true);
      expect(
        schema.max(1).safeParse(
          new Map([
            ["a", 1],
            ["b", 2],
          ]),
        ).success,
      ).toBe(false);
    });
  });

  describe("Instance", () => {
    it("validates class instances", () => {
      class User {}

      expect(mint.instance(User).safeParse(new User()).success).toBe(true);
      expect(mint.instance(User).safeParse({}).success).toBe(false);
    });

    it("validates Date instances", () => {
      expect(mint.instance(Date).safeParse(new Date()).success).toBe(true);
    });
  });

  describe("Function", () => {
    it("validates callable values", () => {
      expect(mint.function().safeParse(() => {}).success).toBe(true);
      expect(mint.function().safeParse("not a function").success).toBe(false);
    });

    it("validates arguments", () => {
      const schema = mint
        .function()
        .args(mint.number(), mint.number())
        .returns(mint.number());

      const add = schema.parse((a, b) => a + b);

      expect(add(2, 3)).toBe(5);
      expect(() => add("2", 3)).toThrow();
    });

    it("validates return values", () => {
      const schema = mint.function().returns(mint.string());

      const fn = schema.parse(() => 42);

      expect(() => fn()).toThrow();
    });
  });

  describe("Promise", () => {
    it("validates promise values", async () => {
      const schema = mint.promise(mint.number());

      await expect(schema.parseAsync(Promise.resolve(42))).resolves.toBe(42);
    });

    it("rejects non-Promise values", async () => {
      const schema = mint.promise(mint.number());

      await expect(schema.parseAsync(42)).rejects.toThrow();
    });

    it("rejects invalid resolved values", async () => {
      const schema = mint.promise(mint.number());

      await expect(schema.parseAsync(Promise.resolve("bad"))).rejects.toThrow();
    });
  });

  describe("Set edge cases", () => {
    it("throws when the element schema is invalid", () => {
      expect(() => mint.set(null)).toThrow(TypeError);
    });

    it("supports exact size constraints", () => {
      const schema = mint.set(mint.number()).size(2);

      expect(schema.safeParse(new Set([1, 2])).success).toBe(true);
      expect(schema.safeParse(new Set([1])).success).toBe(false);
      expect(schema.safeParse(new Set([1, 2, 3])).success).toBe(false);
    });

    it("supports custom size messages", () => {
      const result = mint
        .set(mint.number())
        .min(2, "Too few items")
        .safeParse(new Set([1]));

      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toBe("Too few items");
    });

    it("preserves parsed Set values", () => {
      const result = mint.set(mint.number()).parse(new Set([1, 2]));

      expect(result).toEqual(new Set([1, 2]));
      expect(result).toBeInstanceOf(Set);
    });
  });

  describe("Map edge cases", () => {
    it("throws when key or value schemas are invalid", () => {
      expect(() => mint.map(null, mint.number())).toThrow(TypeError);
      expect(() => mint.map(mint.string(), null)).toThrow(TypeError);
    });

    it("supports exact size constraints", () => {
      const schema = mint.map(mint.string(), mint.number()).size(1);

      expect(schema.safeParse(new Map([["a", 1]])).success).toBe(true);
      expect(schema.safeParse(new Map()).success).toBe(false);
      expect(
        schema.safeParse(
          new Map([
            ["a", 1],
            ["b", 2],
          ]),
        ).success,
      ).toBe(false);
    });

    it("supports nonempty Maps", () => {
      const schema = mint.map(mint.string(), mint.number()).nonempty();

      expect(schema.safeParse(new Map([["a", 1]])).success).toBe(true);
      expect(schema.safeParse(new Map()).success).toBe(false);
    });

    it("supports custom size messages", () => {
      const result = mint
        .map(mint.string(), mint.number())
        .max(1, "Too many entries")
        .safeParse(
          new Map([
            ["a", 1],
            ["b", 2],
          ]),
        );

      expect(result.success).toBe(false);
      expect(result.error.issues[0].message).toBe("Too many entries");
    });

    it("preserves parsed Maps", () => {
      const result = mint
        .map(mint.string(), mint.number())
        .parse(new Map([["a", 1]]));

      expect(result).toBeInstanceOf(Map);
      expect(result).toEqual(new Map([["a", 1]]));
    });
  });
});