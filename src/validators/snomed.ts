/**
 * SNOMED CT SCTID Checksum & Format Validator.
 * Implements the Verhoeff check-digit algorithm specified by SNOMED International.
 *
 * ⚠️ LEGAL BOUNDARY NOTICE:
 * This validator checks the structural Verhoeff check-digit ONLY.
 * It contains ZERO proprietary SNOMED concept dictionaries or descriptions.
 */

// Dihedral group D5 multiplication table
const d = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
  [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
  [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
  [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
  [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
  [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
  [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
  [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
  [9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
] as const;

// Permutation table
const p = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
  [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
  [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
  [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
  [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
  [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
  [7, 0, 4, 6, 9, 1, 3, 2, 5, 8],
] as const;

// Inverse table
const inv = [0, 4, 3, 2, 1, 5, 6, 7, 8, 9] as const;

/**
 * Calculates the Verhoeff check digit for a given numeric SCTID body.
 * @param body Numeric string without the trailing check digit (1 to 17 digits).
 * @returns The single check-digit string, or undefined if input is non-numeric.
 */
export function calculateSctidCheckDigit(body: string): string | undefined {
  if (typeof body !== "string") return undefined;
  const trimmed = body.trim();
  if (!/^\d{1,17}$/.test(trimmed)) return undefined;

  let c = 0;
  const digits = [...trimmed].reverse();
  for (let i = 0; i < digits.length; i++) {
    const digitVal = Number(digits[i]);
    const permuted = p[(i + 1) % 8][digitVal];
    c = d[c][permuted];
  }

  return String(inv[c]);
}

/**
 * Validates whether a full SCTID string is structurally valid with a correct Verhoeff check digit.
 * SNOMED SCTIDs are 6 to 18 digits (or 2 to 18 digits for test vectors).
 */
export function isValidSctid(sctid: string): boolean {
  if (typeof sctid !== "string") return false;
  const trimmed = sctid.trim();
  if (!/^\d{2,18}$/.test(trimmed)) return false;

  const body = trimmed.slice(0, -1);
  const checkDigit = trimmed.slice(-1);
  return calculateSctidCheckDigit(body) === checkDigit;
}
