import { hasProvider, lookup } from "./provider.js";
import { getSystemByIdentifier, getSystemByUri } from "./registry.js";
import { isValidLoincFormat } from "./validators/loinc.js";
import { isValidIcd10CmFormat } from "./validators/icd10cm.js";
import { isValidCptFormat } from "./validators/cpt.js";
import { isValidRxNormFormat } from "./validators/rxnorm.js";
import { isValidSctid } from "./validators/snomed.js";
import { isValidUcumSyntax } from "./validators/ucum.js";
import type {
  CodedConcept,
  SupportedTerminologySystem,
  ValidationIssue,
  ValidationResult,
} from "./types.js";

const formatChecks: Record<
  SupportedTerminologySystem,
  (code: string) => boolean
> = {
  loinc: isValidLoincFormat,
  icd10cm: isValidIcd10CmFormat,
  cpt: isValidCptFormat,
  rxnorm: isValidRxNormFormat,
  snomed: isValidSctid,
  ucum: isValidUcumSyntax,
};

/**
 * Safely extracts a string property value from an unknown object without throwing
 * or triggering prototype pollution side-effects.
 */
function extractString(target: unknown, key: string): string | undefined {
  if (!target || typeof target !== "object" || Array.isArray(target)) {
    return undefined;
  }
  try {
    const val = (target as Record<string, unknown>)[key];
    if (typeof val === "string") {
      return val;
    }
  } catch {
    // If a getter throws or proxy traps fail, fail safely
    return undefined;
  }
  return undefined;
}

/**
 * Validates the structure and code format of a coded concept.
 *
 * @param concept The input concept object (e.g., { system, code, display? }).
 * @returns ValidationResult with validity flag, issues, and system metadata.
 */
export function validate(concept: unknown): ValidationResult {
  const issues: ValidationIssue[] = [];

  if (!concept || typeof concept !== "object" || Array.isArray(concept)) {
    return {
      valid: false,
      issues: [
        {
          severity: "error",
          path: "",
          code: "invalid-type",
          message: "Coded concept must be a non-null object.",
        },
      ],
      providerConfigured: false,
    };
  }

  const rawSystem = extractString(concept, "system");
  const rawCode = extractString(concept, "code");

  if (rawSystem === undefined || rawSystem.trim().length === 0) {
    issues.push({
      severity: "error",
      path: "system",
      code: "required",
      message: "A string system URI is required.",
    });
  }

  if (rawCode === undefined || rawCode.trim().length === 0) {
    issues.push({
      severity: "error",
      path: "code",
      code: "required",
      message: "A non-empty code string is required.",
    });
  }

  if (issues.length > 0) {
    return {
      valid: false,
      issues,
      providerConfigured: false,
    };
  }

  const systemStr = rawSystem!.trim();
  const codeStr = rawCode!.trim();

  // Try matching system by URI, shortName, or OID
  const system = getSystemByUri(systemStr) ?? getSystemByIdentifier(systemStr);

  if (!system) {
    issues.push({
      severity: "warning",
      path: "system",
      code: "unknown-system",
      message: `Unknown terminology system: "${systemStr}". Format validation was skipped.`,
    });
    return {
      valid: true,
      issues,
      providerConfigured: false,
    };
  }

  const validator = formatChecks[system.shortName];
  const isFormatValid = validator ? validator(codeStr) : true;

  if (!isFormatValid) {
    issues.push({
      severity: "error",
      path: "code",
      code: "invalid-format",
      message: `Code "${codeStr}" does not match the structural format for ${system.displayName}.`,
    });
  }

  return {
    valid: issues.filter((i) => i.severity === "error").length === 0,
    issues,
    system,
    providerConfigured: hasProvider(system.uri),
  };
}

/**
 * Validates format and dispatches to a registered TerminologyProvider if configured.
 *
 * @param concept The input concept object (e.g., { system, code, display? }).
 * @returns Promise<ValidationResult> with format & provider validation results.
 */
export async function validateWithProvider(
  concept: unknown
): Promise<ValidationResult> {
  const result = validate(concept);

  if (!result.valid || !result.system || !result.providerConfigured) {
    return result;
  }

  const rawCode = extractString(concept, "code") ?? "";
  const rawDisplay = extractString(concept, "display");

  const codedConcept: CodedConcept = {
    system: result.system.uri,
    code: rawCode.trim(),
    display: rawDisplay,
  };

  try {
    const providerResult = await lookup(
      result.system.uri,
      codedConcept.code,
      codedConcept
    );

    if (providerResult && providerResult.found === false) {
      result.issues.push({
        severity: "warning",
        path: "code",
        code: "provider-not-found",
        message:
          providerResult.message ??
          `Code "${codedConcept.code}" was not found in the registered ${result.system.displayName} provider.`,
      });
    }
  } catch (error) {
    result.issues.push({
      severity: "warning",
      path: "code",
      code: "provider-failed",
      message:
        error instanceof Error
          ? `Provider error: ${error.message}`
          : "Provider failed during concept lookup. Format validation remains valid.",
    });
  }

  return result;
}
