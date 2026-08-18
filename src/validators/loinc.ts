/**
 * LOINC Code Format Validator.
 * Standard LOINC format: 1 to 6 digits, hyphen, 1 check-digit (e.g. "8867-4", "100000-1").
 * Sourced from Regenstrief LOINC specifications.
 */
export const isValidLoincFormat = (code: string): boolean => {
  if (typeof code !== "string") return false;
  const trimmed = code.trim();
  return /^\d{1,6}-\d$/.test(trimmed);
};
