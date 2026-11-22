/**
 * Mint - Schema Validation Library
 * Validation context for tracking parsing state and issues.
 */

import { createIssue } from "../errors/MintError.js";

export class ParseContext {
  constructor({
    path = [],
    issues = [],
    data,
    parent = null,
  } = {}) {
    this.path = [...path];
    this.issues = issues;
    this.data = data;
    this.parent = parent;
  }

  get hasIssues() {
    return this.issues.length > 0;
  }

  get issueCount() {
    return this.issues.length;
  }

  addIssue(issue) {
    const normalizedIssue = createIssue({
      ...issue,
      path: issue.path ?? this.path,
    });

    this.issues.push(normalizedIssue);

    return normalizedIssue;
  }

  child(segment, data) {
    return new ParseContext({
      path: [...this.path, segment],
      issues: this.issues,
      data,
      parent: this,
    });
  }

  fork({
    path = this.path,
    data = this.data,
  } = {}) {
    return new ParseContext({
      path,
      issues: this.issues,
      data,
      parent: this,
    });
  }

  getIssuesSince(index = 0) {
    return this.issues.slice(index);
  }

  checkpoint() {
    return this.issues.length;
  }

  hasIssuesSince(checkpoint) {
    return this.issues.length > checkpoint;
  }

  mergeIssues(issues) {
    for (const issue of issues) {
      this.issues.push(issue);
    }
  }

  clearIssues() {
    this.issues.length = 0;
  }
}