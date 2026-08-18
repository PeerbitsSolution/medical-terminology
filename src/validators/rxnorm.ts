/**
 * RxNorm Code Structural Format Validator.
 * RxNorm Concept Unique Identifiers (RxCUI) are numeric strings of 1 to 8 digits.
 * Sourced from National Library of Medicine (NLM) specification.
 * Zero proprietary code-to-concept datasets shipped.
 */
export const isValidRxNormFormat = (code: string): boolean => {
  if (typeof code !== "string") return false;
  const trimmed = code.trim();
  return /^\d{1,8}$/.test(trimmed);
};
