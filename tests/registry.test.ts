import { describe, expect, it } from "vitest";
import {
  SYSTEM_REGISTRY,
  getSupportedSystems,
  getSystemByIdentifier,
  getSystemByShortName,
  getSystemByUri,
} from "../src/index.js";

describe("medical-terminology: System Registry", () => {
  it("exposes all 6 core terminology systems", () => {
    const systems = getSupportedSystems();
    expect(systems).toHaveLength(6);

    const shortNames = systems.map((s) => s.shortName);
    expect(shortNames).toContain("loinc");
    expect(shortNames).toContain("snomed");
    expect(shortNames).toContain("icd10cm");
    expect(shortNames).toContain("rxnorm");
    expect(shortNames).toContain("cpt");
    expect(shortNames).toContain("ucum");
  });

  it("resolves systems accurately by canonical FHIR URI", () => {
    expect(getSystemByUri("http://loinc.org")?.shortName).toBe("loinc");
    expect(getSystemByUri("http://snomed.info/sct")?.shortName).toBe("snomed");
    expect(getSystemByUri("http://hl7.org/fhir/sid/icd-10-cm")?.shortName).toBe(
      "icd10cm"
    );
    expect(
      getSystemByUri("http://www.nlm.nih.gov/research/umls/rxnorm")?.shortName
    ).toBe("rxnorm");
    expect(getSystemByUri("http://www.ama-assn.org/go/cpt")?.shortName).toBe(
      "cpt"
    );
    expect(getSystemByUri("http://unitsofmeasure.org")?.shortName).toBe("ucum");
  });

  it("handles case-insensitivity and whitespace in URI lookups", () => {
    expect(getSystemByUri("  HTTP://LOINC.ORG  ")?.shortName).toBe("loinc");
    expect(getSystemByUri("HTTP://SNOMED.INFO/SCT")?.shortName).toBe("snomed");
  });

  it("resolves systems accurately by shortName", () => {
    expect(getSystemByShortName("loinc")?.uri).toBe("http://loinc.org");
    expect(getSystemByShortName("snomed")?.uri).toBe("http://snomed.info/sct");
    expect(getSystemByShortName("icd10cm")?.uri).toBe(
      "http://hl7.org/fhir/sid/icd-10-cm"
    );
    expect(getSystemByShortName("rxnorm")?.uri).toBe(
      "http://www.nlm.nih.gov/research/umls/rxnorm"
    );
    expect(getSystemByShortName("cpt")?.uri).toBe(
      "http://www.ama-assn.org/go/cpt"
    );
    expect(getSystemByShortName("ucum")?.uri).toBe("http://unitsofmeasure.org");
  });

  it("resolves systems by OID via getSystemByIdentifier", () => {
    expect(getSystemByIdentifier("2.16.840.1.113883.6.1")?.shortName).toBe(
      "loinc"
    );
    expect(getSystemByIdentifier("2.16.840.1.113883.6.96")?.shortName).toBe(
      "snomed"
    );
    expect(getSystemByIdentifier("2.16.840.1.113883.6.90")?.shortName).toBe(
      "icd10cm"
    );
  });

  it("returns undefined for unknown systems or invalid query types", () => {
    expect(getSystemByUri("https://unknown.system/fhir")).toBeUndefined();
    expect(getSystemByShortName("unknown-sys")).toBeUndefined();
    expect(getSystemByIdentifier("unknown-id")).toBeUndefined();
    expect(getSystemByUri(null as unknown as string)).toBeUndefined();
    expect(getSystemByShortName(undefined as unknown as string)).toBeUndefined();
  });

  it("enforces registry immutability", () => {
    expect(() => {
      // @ts-expect-error - testing immutability
      SYSTEM_REGISTRY.loinc.uri = "https://mutated.org";
    }).toThrow();

    expect(() => {
      // @ts-expect-error - testing immutability
      SYSTEM_REGISTRY.newSystem = { shortName: "new", uri: "..." };
    }).toThrow();
  });
});
