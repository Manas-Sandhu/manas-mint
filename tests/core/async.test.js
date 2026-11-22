import { describe, it, expect } from "vitest";
import { ParseContext } from "../../src/core/ParseContext.js";

describe("ParseContext", () => {
  it("initializes with defaults", () => {
    const context = new ParseContext();

    expect(context.path).toEqual([]);
    expect(context.issues).toEqual([]);
    expect(context.hasIssues).toBe(false);
    expect(context.issueCount).toBe(0);
  });

  it("tracks issues", () => {
    const context = new ParseContext();

    context.addIssue({
      code: "custom",
      message: "Test issue",
    });

    expect(context.hasIssues).toBe(true);
    expect(context.issueCount).toBe(1);
  });

  it("creates child contexts with nested paths", () => {
    const context = new ParseContext({
      path: ["user"],
      data: { name: "Mint" },
    });

    const child = context.child("name", "Mint");

    expect(child.path).toEqual(["user", "name"]);
    expect(child.data).toBe("Mint");
    expect(child.parent).toBe(context);
    expect(child.issues).toBe(context.issues);
  });

  it("creates forked contexts", () => {
    const context = new ParseContext({
      path: ["user"],
      data: "original",
    });

    const fork = context.fork({
      path: ["other"],
      data: "forked",
    });

    expect(fork.path).toEqual(["other"]);
    expect(fork.data).toBe("forked");
    expect(fork.parent).toBe(context);
    expect(fork.issues).toBe(context.issues);
  });

  it("uses original path and data when fork options are omitted", () => {
    const context = new ParseContext({
      path: ["original"],
      data: "value",
    });

    const fork = context.fork();

    expect(fork.path).toEqual(["original"]);
    expect(fork.data).toBe("value");
  });

  it("supports checkpoints and issue slices", () => {
    const context = new ParseContext();

    context.addIssue({ code: "first", message: "First" });

    const checkpoint = context.checkpoint();

    context.addIssue({ code: "second", message: "Second" });

    expect(context.getIssuesSince(checkpoint)).toHaveLength(1);
    expect(context.hasIssuesSince(checkpoint)).toBe(true);
    expect(context.hasIssuesSince(0)).toBe(true);
  });

  it("returns false when there are no issues since checkpoint", () => {
    const context = new ParseContext();
    const checkpoint = context.checkpoint();

    expect(context.hasIssuesSince(checkpoint)).toBe(false);
    expect(context.getIssuesSince(checkpoint)).toEqual([]);
  });

  it("merges issues", () => {
    const context = new ParseContext();

    context.mergeIssues([{ code: "custom", message: "Merged issue" }]);

    expect(context.issueCount).toBe(1);
  });

  it("clears issues", () => {
    const context = new ParseContext();

    context.addIssue({
      code: "custom",
      message: "Issue",
    });

    context.clearIssues();

    expect(context.issues).toEqual([]);
    expect(context.hasIssues).toBe(false);
    expect(context.issueCount).toBe(0);
  });

  it("uses a custom issue path", () => {
    const context = new ParseContext({
      path: ["parent"],
    });

    const issue = context.addIssue({
      code: "custom",
      message: "Custom path",
      path: ["custom"],
    });

    expect(issue.path).toEqual(["custom"]);
  });
});