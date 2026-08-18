/**
 * UCUM (Unified Code for Units of Measure) Syntax Validator.
 * Validates whether a unit string adheres to conservative UCUM lexical syntax.
 * Sourced from the UCUM specification (Regenstrief Institute).
 */
export const isValidUcumSyntax = (unit: string): boolean => {
  if (typeof unit !== "string") return false;
  const trimmed = unit.trim();
  if (trimmed.length === 0 || trimmed.length > 64) return false;
  return /^[A-Za-z0-9\[\]{}().*\/^+\-_%'|]+$/.test(trimmed);
};
