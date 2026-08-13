import { Violation } from './types.js';

export class LawViolationError extends Error {
  public readonly violations: Violation[];

  constructor(violations: Violation[]) {
    const summary = violations
      .map((v) => `[${v.code}] at ${v.path}: ${v.message}`)
      .join('\n');
    super(`Metastruct Semantic Law Validation Failed (${violations.length} violation(s)):\n${summary}`);
    this.name = 'LawViolationError';
    this.violations = violations;
    Object.setPrototypeOf(this, LawViolationError.prototype);
  }
}