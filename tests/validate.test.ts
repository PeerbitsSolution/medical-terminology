import { beforeEach, describe, expect, it } from "vitest";
import {
  clearProviders,
  registerProvider,
  validate,
  validateWithProvider,
} from "../src/index.js";

describe("medical-terminology: Core Validation Engine", () => {
  beforeEach(() => {
    clearProviders();
  });

  describe("validate() sync validation", () => {
    it("validates well-formed concepts across all 6 systems", () => {
      const concepts = [
        { system: "http://loinc.org", code: "8867-4" },
        { system: "http://snomed.info/sct", code: "73211009" },
        { system: "http://hl7.org/fhir/sid/icd-10-cm", code: "E11.9" },
        {
          system: "http://www.nlm.nih.gov/research/umls/rxnorm",
          code: "123456",
        },
        { system: "http://www.ama-assn.org/go/cpt", code: "99213" },
        { system: "http://unitsofmeasure.org", code: "mg/dL" },
      ];

      for (const concept of concepts) {
        const res = validate(concept);
        expect(res.valid).toBe(true);
        expect(res.issues).toHaveLength(0);
        expect(res.system).toBeDefined();
        expect(res.providerConfigured).toBe(false);
      }
    });

    it("accepts shortName and OID identifiers as system", () => {
      const byShortName = validate({ system: "loinc", code: "8867-4" });
      expect(byShortName.valid).toBe(true);
      expect(byShortName.system?.shortName).toBe("loinc");

      const byOid = validate({
        system: "2.16.840.1.113883.6.1",
        code: "8867-4",
      });
      expect(byOid.valid).toBe(true);
      expect(byOid.system?.shortName).toBe("loinc");
    });

    it("emits warning issue for unknown system and skips format check", () => {
      const res = validate({
        system: "http://custom-terminology.org/codes",
        code: "ANY-CODE-123",
      });

      expect(res.valid).toBe(true);
      expect(res.issues).toHaveLength(1);
      expect(res.issues[0].severity).toBe("warning");
      expect(res.issues[0].code).toBe("unknown-system");
      expect(res.issues[0].path).toBe("system");
    });

    it("emits error issue when system is missing", () => {
      const res = validate({ code: "8867-4" });
      expect(res.valid).toBe(false);
      expect(res.issues.some((i) => i.path === "system" && i.code === "required")).toBe(
        true
      );
    });

    it("emits error issue when code is missing or empty", () => {
      const res1 = validate({ system: "http://loinc.org" });
      expect(res1.valid).toBe(false);
      expect(res1.issues.some((i) => i.path === "code" && i.code === "required")).toBe(
        true
      );

      const res2 = validate({ system: "http://loinc.org", code: "   " });
      expect(res2.valid).toBe(false);
      expect(res2.issues.some((i) => i.path === "code" && i.code === "required")).toBe(
        true
      );
    });

    it("emits error issue for malformed code in recognized system", () => {
      const res = validate({
        system: "http://loinc.org",
        code: "INVALID_LOINC",
      });

      expect(res.valid).toBe(false);
      expect(res.issues).toHaveLength(1);
      expect(res.issues[0].severity).toBe("error");
      expect(res.issues[0].code).toBe("invalid-format");
      expect(res.issues[0].path).toBe("code");
    });
  });

  describe("validateWithProvider() async validation", () => {
    it("returns format result directly if no provider configured", async () => {
      const res = await validateWithProvider({
        system: "http://loinc.org",
        code: "8867-4",
      });

      expect(res.valid).toBe(true);
      expect(res.issues).toHaveLength(0);
      expect(res.providerConfigured).toBe(false);
    });

    it("does not invoke provider if format validation failed", async () => {
      let providerCalled = false;
      registerProvider("loinc", () => {
        providerCalled = true;
        return { found: true };
      });

      const res = await validateWithProvider({
        system: "http://loinc.org",
        code: "INVALID_LOINC_CODE",
      });

      expect(res.valid).toBe(false);
      expect(providerCalled).toBe(false);
    });

    it("passes concept with display to registered provider", async () => {
      let passedDisplay: string | undefined;
      registerProvider("loinc", (_code, concept) => {
        passedDisplay = concept.display;
        return { found: true };
      });

      await validateWithProvider({
        system: "http://loinc.org",
        code: "8867-4",
        display: "Heart rate in beats per minute",
      });

      expect(passedDisplay).toBe("Heart rate in beats per minute");
    });
  });
});
