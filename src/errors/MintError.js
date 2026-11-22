/**
 * Mint - Schema Validation Library
 * Core validation error system.
 */

export class MintError extends Error {
  constructor(issues, message = "Validation failed") {
    super(message);

    this.name = "MintError";
    this.issues = issues;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, MintError);
    }
  }

  get errors() {
    return this.issues;
  }

  format() {
    const formatted = {};

    for (const issue of this.issues) {
      let current = formatted;

      for (const segment of issue.path) {
        const key = String(segment);

        if (!current[key]) {
          current[key] = {};
        }

        current = current[key];
      }

      if (!current._errors) {
        current._errors = [];
      }

      current._errors.push(issue.message);
    }

    return formatted;
  }

  flatten() {
    const fieldErrors = {};
    const formErrors = [];

    for (const issue of this.issues) {
      if (issue.path.length === 0) {
        formErrors.push(issue.message);
        continue;
      }

      const field = String(issue.path[0]);

      if (!fieldErrors[field]) {
        fieldErrors[field] = [];
      }

      fieldErrors[field].push(issue.message);
    }

    return {
      formErrors,
      fieldErrors,
    };
  }

  toString() {
    return this.issues
      .map((issue) => {
        const path =
          issue.path.length > 0
            ? issue.path.join(".")
            : "(root)";

        return `${path}: ${issue.message}`;
      })
      .join("\n");
  }
}

export function createIssue({
  code,
  path = [],
  message,
  ...metadata
}) {
  return {
    code,
    path: [...path],
    message,
    ...metadata,
  };
}

export function formatIssue(issue) {
  const path =
    issue.path.length > 0
      ? issue.path.join(".")
      : "(root)";

  return `${path}: ${issue.message}`;
}