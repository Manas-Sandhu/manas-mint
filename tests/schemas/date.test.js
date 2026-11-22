import { describe, it, expect } from "vitest";
import mint from "../../src/index.js";

describe("DateSchema", () => {
  const earlier = new Date("2020-01-01T00:00:00Z");
  const middle = new Date("2022-01-01T00:00:00Z");
  const later = new Date("2024-01-01T00:00:00Z");

  it("accepts valid dates", () => {
    expect(mint.date().safeParse(middle).success).toBe(true);
  });

  it("rejects invalid Date objects", () => {
    expect(mint.date().safeParse(new Date("invalid")).success).toBe(false);
  });

  it("supports minimum date", () => {
    expect(mint.date().min(middle).safeParse(later).success).toBe(true);
    expect(mint.date().min(middle).safeParse(earlier).success).toBe(false);
  });

  it("supports maximum date", () => {
    expect(mint.date().max(middle).safeParse(earlier).success).toBe(true);
    expect(mint.date().max(middle).safeParse(later).success).toBe(false);
  });

  it("supports greater than", () => {
    expect(mint.date().gt(middle).safeParse(later).success).toBe(true);
    expect(mint.date().gt(middle).safeParse(middle).success).toBe(false);
  });

  it("supports less than", () => {
    expect(mint.date().lt(middle).safeParse(earlier).success).toBe(true);
    expect(mint.date().lt(middle).safeParse(middle).success).toBe(false);
  });

  it("supports greater than or equal", () => {
    expect(mint.date().gte(middle).safeParse(middle).success).toBe(true);
    expect(mint.date().gte(middle).safeParse(earlier).success).toBe(false);
  });

  it("supports less than or equal", () => {
    expect(mint.date().lte(middle).safeParse(middle).success).toBe(true);
    expect(mint.date().lte(middle).safeParse(later).success).toBe(false);
  });

  it("preserves the input Date", () => {
    const input = new Date("2023-06-15T00:00:00Z");
    const parsed = mint.date().parse(input);

    expect(parsed).toEqual(input);
    expect(parsed).toBe(input);
  });
});