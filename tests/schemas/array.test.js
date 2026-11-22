import { describe, it, expect } from "vitest";
import mint from "../../src/index.js";

describe("ArraySchema", () => {
  it("accepts arrays", () => {
    expect(mint.array(mint.string()).parse(["a", "b"])).toEqual(["a", "b"]);
  });

  it("rejects non-arrays", () => {
    expect(mint.array(mint.string()).safeParse("hello").success).toBe(false);
  });

  it("validates each element", () => {
    const result = mint.array(mint.number()).safeParse([1, "two", 3]);

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0].path).toEqual([1]);
    }
  });

  it("supports min length", () => {
    expect(mint.array(mint.string()).min(2).safeParse(["a", "b"]).success).toBe(true);
    expect(mint.array(mint.string()).min(2).safeParse(["a"]).success).toBe(false);
  });

  it("supports max length", () => {
    expect(mint.array(mint.string()).max(2).safeParse(["a", "b"]).success).toBe(true);
    expect(mint.array(mint.string()).max(2).safeParse(["a", "b", "c"]).success).toBe(false);
  });

  it("supports exact length", () => {
    expect(mint.array(mint.string()).length(2).safeParse(["a", "b"]).success).toBe(true);
    expect(mint.array(mint.string()).length(2).safeParse(["a"]).success).toBe(false);
  });

  it("supports nonempty", () => {
    expect(mint.array(mint.string()).nonempty().safeParse(["a"]).success).toBe(true);
    expect(mint.array(mint.string()).nonempty().safeParse([]).success).toBe(false);
  });

  it("supports nested arrays", () => {
    const schema = mint.array(mint.array(mint.number()));

    expect(schema.safeParse([[1, 2], [3, 4]]).success).toBe(true);
    expect(schema.safeParse([[1], ["invalid"]]).success).toBe(false);
  });
});