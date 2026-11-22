import { describe, it, expect } from "vitest";
import {
  MintError,
  createIssue,
  formatIssue,
} from "../../src/index.js";

describe("MintError", () => {
  const issues = [
    {
      code: "invalid_type",
      path: ["name"],
      message: "Expected string",
    },
    {
      code: "too_small",
      path: ["age"],
      message: "Must be positive",
    },
    {
      code: "custom",
      path: [],
      message: "Invalid form",
    },
  ];

  it("stores validation issues", () => {
    const error = new MintError(issues);

    expect(error.issues).toEqual(issues);
    expect(error.errors).toEqual(issues);
    expect(error.name).toBe("MintError");
  });

  it("formats nested errors", () => {
    const error = new MintError([
      {
        code: "invalid_type",
        path: ["user", "name"],
        message: "Expected string",
      },
    ]);

    expect(error.format()).toEqual({
      user: {
        name: {
          _errors: ["Expected string"],
        },
      },
    });
  });

  it("flattens field and form errors", () => {
    const error = new MintError(issues);

    expect(error.flatten()).toEqual({
      formErrors: ["Invalid form"],
      fieldErrors: {
        name: ["Expected string"],
        age: ["Must be positive"],
      },
    });
  });

  it("creates readable string output", () => {
    const error = new MintError(issues);

    expect(error.toString()).toContain("name: Expected string");
    expect(error.toString()).toContain("age: Must be positive");
    expect(error.toString()).toContain("(root): Invalid form");
  });

  it("creates issues with metadata", () => {
    const issue = createIssue({
      code: "custom",
      path: ["field"],
      message: "Invalid",
      extra: true,
    });

    expect(issue).toEqual({
      code: "custom",
      path: ["field"],
      message: "Invalid",
      extra: true,
    });
  });

  it("formats individual issues", () => {
    expect(formatIssue({
      path: ["user", "email"],
      message: "Invalid email",
    })).toBe("user.email: Invalid email");
  });
});