/**
 * ICD-10-CM Code Format Validator.
 * Standard format: Letter (A-Z) followed by 2 alphanumeric characters,
 * optionally followed by a period and 1-4 alphanumeric characters (e.g. "A00.1", "E11.9", "S82.101A").
 * Public domain specification (CMS / CDC NCHS).
 */
export const isValidIcd10CmFormat = (code: string): boolean => {
  if (typeof code !== "string") return false;
  const trimmed = code.trim();
  return /^[A-Za-z][0-9][0-9A-Za-z](?:\.?[0-9A-Za-z]{1,4})?$/.test(trimmed);
};
