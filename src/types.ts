export type SupportedTerminologySystem =
  | "loinc"
  | "snomed"
  | "icd10cm"
  | "rxnorm"
  | "cpt"
  | "ucum";

export type ValidationSeverity = "error" | "warning" | "information";

export interface TerminologySystem {
  shortName: SupportedTerminologySystem;
  uri: string;
  displayName: string;
  oid?: string;
  description?: string;
}

export interface CodedConcept {
  system: string;
  code: string;
  display?: string;
}

export interface ValidationIssue {
  severity: ValidationSeverity;
  path: string;
  code: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  issues: ValidationIssue[];
  system?: TerminologySystem;
  providerConfigured: boolean;
}

export interface ProviderLookupResult {
  found: boolean;
  display?: string;
  message?: string;
}

export type TerminologyProvider = (
  code: string,
  concept: Readonly<CodedConcept>
) => ProviderLookupResult | Promise<ProviderLookupResult>;
