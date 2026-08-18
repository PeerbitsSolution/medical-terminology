export const VERSION = "1.0.0";

export { validate, validateWithProvider } from "./validate.js";

export {
  registerProvider,
  unregisterProvider,
  clearProviders,
  lookup,
  hasProvider,
  getRegisteredProviderSystems,
} from "./provider.js";

export {
  SYSTEM_REGISTRY,
  getSupportedSystems,
  getSystemByIdentifier,
  getSystemByShortName,
  getSystemByUri,
} from "./registry.js";

export { isValidLoincFormat } from "./validators/loinc.js";
export { isValidIcd10CmFormat } from "./validators/icd10cm.js";
export { isValidCptFormat } from "./validators/cpt.js";
export { isValidRxNormFormat } from "./validators/rxnorm.js";
export { isValidUcumSyntax } from "./validators/ucum.js";
export {
  calculateSctidCheckDigit,
  isValidSctid,
} from "./validators/snomed.js";

export type {
  CodedConcept,
  ProviderLookupResult,
  SupportedTerminologySystem,
  TerminologyProvider,
  TerminologySystem,
  ValidationIssue,
  ValidationResult,
  ValidationSeverity,
} from "./types.js";
