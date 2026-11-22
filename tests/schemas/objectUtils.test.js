import { describe, it, expect } from "vitest";

import {
  isPlainObject,
  getObjectKeys,
  hasOwn,
  omitKeys,
  pickKeys,
} from "../../src/utils/objectUtils.js";

describe("objectUtils", () => {
  describe("isPlainObject", () => {
    it("accepts plain objects", () => {
      expect(isPlainObject({})).toBe(true);
      expect(isPlainObject({ name: "Mint" })).toBe(true);
    });

    it("accepts null-prototype objects", () => {
      const value = Object.create(null);

      expect(isPlainObject(value)).toBe(true);
    });

    it("rejects null", () => {
      expect(isPlainObject(null)).toBe(false);
    });

    it("rejects arrays", () => {
      expect(isPlainObject([])).toBe(false);
    });

    it("rejects dates", () => {
      expect(isPlainObject(new Date())).toBe(false);
    });

    it("rejects class instances", () => {
      class Example {}

      expect(isPlainObject(new Example())).toBe(false);
    });
  });

  describe("getObjectKeys", () => {
    it("returns enumerable own keys", () => {
      expect(getObjectKeys({ a: 1, b: 2 })).toEqual(["a", "b"]);
    });
  });

  describe("hasOwn", () => {
    it("detects own properties", () => {
      expect(hasOwn({ a: 1 }, "a")).toBe(true);
      expect(hasOwn({ a: 1 }, "b")).toBe(false);
    });

    it("does not treat inherited properties as own", () => {
      const value = Object.create({ inherited: true });

      expect(hasOwn(value, "inherited")).toBe(false);
    });
  });

  describe("omitKeys", () => {
    it("omits specified keys", () => {
      expect(omitKeys(
        { a: 1, b: 2, c: 3 },
        ["b"]
      )).toEqual({
        a: 1,
        c: 3,
      });
    });

    it("returns a copy when no keys are omitted", () => {
      const input = { a: 1 };
      const output = omitKeys(input, []);

      expect(output).toEqual(input);
      expect(output).not.toBe(input);
    });
  });

  describe("pickKeys", () => {
    it("selects specified keys", () => {
      expect(pickKeys(
        { a: 1, b: 2, c: 3 },
        ["a", "c"]
      )).toEqual({
        a: 1,
        c: 3,
      });
    });

    it("returns an empty object for no selected keys", () => {
      expect(pickKeys(
        { a: 1, b: 2 },
        []
      )).toEqual({});
    });
  });
});