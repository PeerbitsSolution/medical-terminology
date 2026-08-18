/**
 * CPT Code Structural Format Validator.
 *
 * ⚠️ LEGAL BOUNDARY NOTICE:
 * This validator checks structural syntax ONLY (5-digit numeric or 4-digit + trailing alpha).
 * This repository contains ZERO real CPT codes, descriptions, or copyrighted AMA material.
 * See docs/LICENSING.md for legal compliance requirements.
 */
export const isValidCptFormat = (code: string): boolean => {
  if (typeof code !== "string") return false;
  const trimmed = code.trim();
  return /^\d{5}$|^\d{4}[A-Za-z]$/.test(trimmed);
};
