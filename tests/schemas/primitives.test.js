import { describe, it, expect } from "vitest";
import mint from "../../src/index.js";

describe("Primitive schemas", () => {
  describe("string", () => {
    it("accepts strings", () => {
      expect(mint.string().parse("hello")).toBe("hello");
    });

    it("rejects non-strings", () => {
      expect(mint.string().safeParse(123).success).toBe(false);
    });

    it("supports min and max", () => {
      expect(mint.string().min(2).parse("ab")).toBe("ab");
      expect(mint.string().max(3).parse("abc")).toBe("abc");

      expect(mint.string().min(3).safeParse("ab").success).toBe(false);
      expect(mint.string().max(2).safeParse("abc").success).toBe(false);
    });

    it("supports exact length", () => {
      expect(mint.string().length(3).safeParse("abc").success).toBe(true);
      expect(mint.string().length(3).safeParse("ab").success).toBe(false);
    });

    it("supports email validation", () => {
      expect(mint.string().email().safeParse("a@b.com").success).toBe(true);
      expect(mint.string().email().safeParse("invalid").success).toBe(false);
    });

    it("supports URL validation", () => {
      expect(mint.string().url().safeParse("https://example.com").success).toBe(
        true,
      );
      expect(mint.string().url().safeParse("not-a-url").success).toBe(false);
    });

    it("supports regex validation", () => {
      expect(
        mint
          .string()
          .regex(/^[A-Z]+$/)
          .safeParse("MINT").success,
      ).toBe(true);
      expect(
        mint
          .string()
          .regex(/^[A-Z]+$/)
          .safeParse("Mint").success,
      ).toBe(false);
    });

    it("supports string transformations", () => {
      expect(mint.string().trim().parse("  hello  ")).toBe("hello");
      expect(mint.string().lowercase().parse("HELLO")).toBe("hello");
      expect(mint.string().uppercase().parse("hello")).toBe("HELLO");
    });

    it("supports startsWith, endsWith and includes", () => {
      expect(mint.string().startsWith("mi").safeParse("mint").success).toBe(
        true,
      );
      expect(mint.string().endsWith("nt").safeParse("mint").success).toBe(true);
      expect(mint.string().includes("in").safeParse("mint").success).toBe(true);
    });
  });

  describe("number", () => {
    it("accepts numbers", () => {
      expect(mint.number().parse(42)).toBe(42);
    });

    it("rejects NaN", () => {
      expect(mint.number().safeParse(NaN).success).toBe(false);
    });

    it("rejects non-numbers", () => {
      expect(mint.number().safeParse("42").success).toBe(false);
    });

    it("supports range constraints", () => {
      expect(mint.number().min(2).safeParse(2).success).toBe(true);
      expect(mint.number().max(5).safeParse(5).success).toBe(true);
      expect(mint.number().gt(2).safeParse(3).success).toBe(true);
      expect(mint.number().lt(5).safeParse(4).success).toBe(true);
    });

    it("supports integer validation", () => {
      expect(mint.number().int().safeParse(2).success).toBe(true);
      expect(mint.number().int().safeParse(2.5).success).toBe(false);
    });

    it("supports positive and negative checks", () => {
      expect(mint.number().positive().safeParse(1).success).toBe(true);
      expect(mint.number().negative().safeParse(-1).success).toBe(true);
      expect(mint.number().nonnegative().safeParse(0).success).toBe(true);
      expect(mint.number().nonpositive().safeParse(0).success).toBe(true);
    });

    it("supports finite numbers", () => {
      expect(mint.number().finite().safeParse(Infinity).success).toBe(false);
      expect(mint.number().finite().safeParse(10).success).toBe(true);
    });

    it("supports multipleOf", () => {
      expect(mint.number().multipleOf(3).safeParse(9).success).toBe(true);
      expect(mint.number().multipleOf(3).safeParse(10).success).toBe(false);
    });
  });

  describe("boolean", () => {
    it("accepts booleans", () => {
      expect(mint.boolean().parse(true)).toBe(true);
      expect(mint.boolean().parse(false)).toBe(false);
    });

    it("rejects non-booleans", () => {
      expect(mint.boolean().safeParse(1).success).toBe(false);
    });
  });

  describe("bigint", () => {
    it("accepts bigint", () => {
      expect(mint.bigint().parse(10n)).toBe(10n);
    });

    it("rejects regular numbers", () => {
      expect(mint.bigint().safeParse(10).success).toBe(false);
    });

    it("supports comparisons", () => {
      expect(mint.bigint().positive().safeParse(1n).success).toBe(true);
      expect(mint.bigint().min(5n).safeParse(5n).success).toBe(true);
      expect(mint.bigint().max(10n).safeParse(11n).success).toBe(false);
    });
  });

  describe("date", () => {
    it("accepts valid Date instances", () => {
      const date = new Date("2025-01-01");
      expect(mint.date().safeParse(date).success).toBe(true);
    });

    it("rejects invalid dates", () => {
      expect(mint.date().safeParse(new Date("invalid")).success).toBe(false);
    });

    it("rejects date strings", () => {
      expect(mint.date().safeParse("2025-01-01").success).toBe(false);
    });
  });

  describe("special types", () => {
    it("validates null", () => {
      expect(mint.null().safeParse(null).success).toBe(true);
      expect(mint.null().safeParse(undefined).success).toBe(false);
    });

    it("validates undefined", () => {
      expect(mint.undefined().safeParse(undefined).success).toBe(true);
      expect(mint.undefined().safeParse(null).success).toBe(false);
    });

    it("validates void", () => {
      expect(mint.void().safeParse(undefined).success).toBe(true);
    });

    it("accepts any value", () => {
      expect(mint.any().safeParse({ a: 1 }).success).toBe(true);
    });

    it("accepts unknown values", () => {
      expect(mint.unknown().safeParse({ a: 1 }).success).toBe(true);
    });

    it("never accepts a value", () => {
      expect(mint.never().safeParse(1).success).toBe(false);
      expect(mint.never().safeParse(undefined).success).toBe(false);
    });

    it("validates symbols", () => {
      expect(mint.symbol().safeParse(Symbol("x")).success).toBe(true);
      expect(mint.symbol().safeParse("x").success).toBe(false);
    });
  });

  describe("literal", () => {
    it("validates exact literals", () => {
      expect(mint.literal("mint").safeParse("mint").success).toBe(true);
      expect(mint.literal("mint").safeParse("Mint").success).toBe(false);
      expect(mint.literal(1).safeParse(1).success).toBe(true);
    });
  });

  describe("enum", () => {
    it("validates enum values", () => {
      const role = mint.enum(["admin", "user"]);

      expect(role.safeParse("admin").success).toBe(true);
      expect(role.safeParse("user").success).toBe(true);
      expect(role.safeParse("guest").success).toBe(false);
    });

    it("accepts object values", () => {
      const role = mint.enum({
        ADMIN: "admin",
        USER: "user",
      });

      expect(role.parse("admin")).toBe("admin");
      expect(role.parse("user")).toBe("user");
      expect(role.safeParse("guest").success).toBe(false);
    });

    it("removes duplicate values", () => {
      const role = mint.enum(["admin", "user", "admin", "user"]);

      expect(role.values).toEqual(["admin", "user"]);
    });

    it("rejects empty enums", () => {
      expect(() => mint.enum([])).toThrow(
        "EnumSchema requires at least one allowed value.",
      );

      expect(() => mint.enum({})).toThrow(
        "EnumSchema requires at least one allowed value.",
      );
    });

    it("rejects invalid input types", () => {
      expect(() => mint.enum("admin")).toThrow(
        "EnumSchema expects an array or an object of values.",
      );

      expect(() => mint.enum(null)).toThrow(
        "EnumSchema expects an array or an object of values.",
      );
    });

    it("supports different value types", () => {
      const values = mint.enum([1, true, null, undefined, 10n, Symbol("mint")]);

      expect(values.parse(1)).toBe(1);
      expect(values.parse(true)).toBe(true);
      expect(values.parse(null)).toBe(null);
      expect(values.parse(undefined)).toBe(undefined);
      expect(values.parse(10n)).toBe(10n);
    });

    it("uses Object.is to compare enum values", () => {
      const schema = mint.enum([NaN]);

      expect(schema.safeParse(NaN).success).toBe(true);
      expect(schema.safeParse(0).success).toBe(false);
    });

    it("formats invalid enum values in the error message", () => {
      const schema = mint.enum([
        "admin",
        1,
        10n,
        Symbol("mint"),
        undefined,
        null,
        true,
      ]);

      const result = schema.safeParse("guest");

      expect(result.success).toBe(false);

      const message = result.error.issues[0].message;

      expect(message).toContain('"admin"');
      expect(message).toContain("10n");
      expect(message).toContain("Symbol(mint)");
      expect(message).toContain("undefined");
      expect(message).toContain("null");
      expect(message).toContain("true");
    });
  });
});