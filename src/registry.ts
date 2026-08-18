import type { SupportedTerminologySystem, TerminologySystem } from "./types.js";

export const SYSTEM_REGISTRY: Readonly<
  Record<SupportedTerminologySystem, Readonly<TerminologySystem>>
> = Object.freeze({
  loinc: Object.freeze({
    shortName: "loinc",
    uri: "http://loinc.org",
    displayName: "LOINC",
    oid: "2.16.840.1.113883.6.1",
    description: "Logical Observation Identifiers Names and Codes",
  }),
  snomed: Object.freeze({
    shortName: "snomed",
    uri: "http://snomed.info/sct",
    displayName: "SNOMED CT",
    oid: "2.16.840.1.113883.6.96",
    description: "SNOMED Clinical Terms",
  }),
  icd10cm: Object.freeze({
    shortName: "icd10cm",
    uri: "http://hl7.org/fhir/sid/icd-10-cm",
    displayName: "ICD-10-CM",
    oid: "2.16.840.1.113883.6.90",
    description: "International Classification of Diseases, 10th Revision, Clinical Modification",
  }),
  rxnorm: Object.freeze({
    shortName: "rxnorm",
    uri: "http://www.nlm.nih.gov/research/umls/rxnorm",
    displayName: "RxNorm",
    oid: "2.16.840.1.113883.6.88",
    description: "National Library of Medicine RxNorm",
  }),
  cpt: Object.freeze({
    shortName: "cpt",
    uri: "http://www.ama-assn.org/go/cpt",
    displayName: "CPT",
    oid: "2.16.840.1.113883.6.12",
    description: "Current Procedural Terminology (AMA)",
  }),
  ucum: Object.freeze({
    shortName: "ucum",
    uri: "http://unitsofmeasure.org",
    displayName: "UCUM",
    oid: "2.16.840.1.113883.6.8",
    description: "Unified Code for Units of Measure",
  }),
});

const allSystems: readonly TerminologySystem[] = Object.freeze(
  Object.values(SYSTEM_REGISTRY)
);

const byUri = new Map<string, Readonly<TerminologySystem>>(
  allSystems.map((s) => [s.uri.toLowerCase(), s])
);

const byShortName = new Map<string, Readonly<TerminologySystem>>(
  allSystems.map((s) => [s.shortName.toLowerCase(), s])
);

const byOid = new Map<string, Readonly<TerminologySystem>>(
  allSystems
    .filter((s): s is TerminologySystem & { oid: string } => !!s.oid)
    .map((s) => [s.oid.toLowerCase(), s])
);

export const getSupportedSystems = (): readonly TerminologySystem[] => allSystems;

export const getSystemByShortName = (
  shortName: string
): TerminologySystem | undefined => {
  if (typeof shortName !== "string") return undefined;
  return byShortName.get(shortName.trim().toLowerCase());
};

export const getSystemByUri = (
  uri: string
): TerminologySystem | undefined => {
  if (typeof uri !== "string") return undefined;
  return byUri.get(uri.trim().toLowerCase());
};

export const getSystemByIdentifier = (
  identifier: string
): TerminologySystem | undefined => {
  if (typeof identifier !== "string") return undefined;
  const clean = identifier.trim().toLowerCase();
  return byUri.get(clean) ?? byShortName.get(clean) ?? byOid.get(clean);
};
