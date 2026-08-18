import { describe, expect, it } from "vitest";
import {
  isValidLoincFormat,
  isValidIcd10CmFormat,
  isValidCptFormat,
  isValidRxNormFormat,
  isValidUcumSyntax,
  isValidSctid,
} from "../src/index.js";

describe("medical-terminology: Format Validators", () => {
  describe("LOINC Format Validator", () => {
    it("accepts valid LOINC code patterns", () => {
      expect(isValidLoincFormat("8867-4")).toBe(true);
      expect(isValidLoincFormat("8480-6")).toBe(true);
      expect(isValidLoincFormat("29463-7")).toBe(true);
      expect(isValidLoincFormat("1-8")).toBe(true);
      expect(isValidLoincFormat("100000-1")).toBe(true);
      expect(isValidLoincFormat("  8867-4  ")).toBe(true);
    });

    it("rejects invalid LOINC formats", () => {
      expect(isValidLoincFormat("88674")).toBe(false); // missing hyphen
      expect(isValidLoincFormat("8867-")).toBe(false); // missing check digit
      expect(isValidLoincFormat("-4")).toBe(false); // missing body
      expect(isValidLoincFormat("8867-45")).toBe(false); // 2 check digits
      expect(isValidLoincFormat("88A7-4")).toBe(false); // alphanumeric body
      expect(isValidLoincFormat("")).toBe(false);
      expect(isValidLoincFormat("   ")).toBe(false);
      expect(isValidLoincFormat(null as unknown as string)).toBe(false);
    });
  });

  describe("ICD-10-CM Format Validator", () => {
    it("accepts valid ICD-10-CM alphanumeric structures", () => {
      expect(isValidIcd10CmFormat("A00.1")).toBe(true);
      expect(isValidIcd10CmFormat("E11.9")).toBe(true);
      expect(isValidIcd10CmFormat("I10")).toBe(true);
      expect(isValidIcd10CmFormat("S82.101A")).toBe(true);
      expect(isValidIcd10CmFormat("Z99.89")).toBe(true);
      expect(isValidIcd10CmFormat("U07.1")).toBe(true);
      expect(isValidIcd10CmFormat("a00.1")).toBe(true); // lower-case allowed
      expect(isValidIcd10CmFormat("A001")).toBe(true); // unpunctuated format
    });

    it("rejects invalid ICD-10-CM structures", () => {
      expect(isValidIcd10CmFormat("123.4")).toBe(false); // starts with digit
      expect(isValidIcd10CmFormat("A")).toBe(false); // too short
      expect(isValidIcd10CmFormat("A1")).toBe(false); // too short
      expect(isValidIcd10CmFormat("A00.12345")).toBe(false); // > 4 sub-characters
      expect(isValidIcd10CmFormat("")).toBe(false);
      expect(isValidIcd10CmFormat("   ")).toBe(false);
      expect(isValidIcd10CmFormat(undefined as unknown as string)).toBe(false);
    });
  });

  describe("CPT Structural Format Validator (Zero Dataset Content)", () => {
    it("accepts valid synthetic 5-digit and category II/III patterns", () => {
      expect(isValidCptFormat("10000")).toBe(true);
      expect(isValidCptFormat("99999")).toBe(true);
      expect(isValidCptFormat("00000")).toBe(true);
      expect(isValidCptFormat("0001T")).toBe(true);
      expect(isValidCptFormat("0001F")).toBe(true);
      expect(isValidCptFormat("  99213  ")).toBe(true);
    });

    it("rejects invalid CPT structural patterns", () => {
      expect(isValidCptFormat("1234")).toBe(false); // 4 digits
      expect(isValidCptFormat("123456")).toBe(false); // 6 digits
      expect(isValidCptFormat("ABCDE")).toBe(false);
      expect(isValidCptFormat("1234#")).toBe(false);
      expect(isValidCptFormat("")).toBe(false);
      expect(isValidCptFormat("   ")).toBe(false);
    });
  });

  describe("RxNorm Format Validator", () => {
    it("accepts valid numeric RxCUIs", () => {
      expect(isValidRxNormFormat("123456")).toBe(true);
      expect(isValidRxNormFormat("897654")).toBe(true);
      expect(isValidRxNormFormat("1")).toBe(true);
      expect(isValidRxNormFormat("12345678")).toBe(true);
      expect(isValidRxNormFormat("  316049  ")).toBe(true);
    });

    it("rejects invalid RxNorm formats", () => {
      expect(isValidRxNormFormat("123456789")).toBe(false); // > 8 digits
      expect(isValidRxNormFormat("RX12345")).toBe(false);
      expect(isValidRxNormFormat("-12345")).toBe(false);
      expect(isValidRxNormFormat("")).toBe(false);
      expect(isValidRxNormFormat(null as unknown as string)).toBe(false);
    });
  });

  describe("UCUM Syntax Validator", () => {
    it("accepts standard UCUM unit expressions", () => {
      expect(isValidUcumSyntax("mg/dL")).toBe(true);
      expect(isValidUcumSyntax("mm[Hg]")).toBe(true);
      expect(isValidUcumSyntax("kg")).toBe(true);
      expect(isValidUcumSyntax("10*3/uL")).toBe(true);
      expect(isValidUcumSyntax("cm")).toBe(true);
      expect(isValidUcumSyntax("g/mol")).toBe(true);
      expect(isValidUcumSyntax("%")).toBe(true);
      expect(isValidUcumSyntax("[degF]")).toBe(true);
      expect(isValidUcumSyntax("cel")).toBe(true);
      expect(isValidUcumSyntax("mL/min/1.73.m2")).toBe(true);
    });

    it("rejects invalid UCUM syntax expressions", () => {
      expect(isValidUcumSyntax("")).toBe(false);
      expect(isValidUcumSyntax("   ")).toBe(false);
      expect(isValidUcumSyntax("mg / dL")).toBe(false); // contains whitespace
      expect(isValidUcumSyntax("a".repeat(65))).toBe(false); // > 64 chars
      expect(isValidUcumSyntax("mg\ndL")).toBe(false);
      expect(isValidUcumSyntax(null as unknown as string)).toBe(false);
    });
  });

  describe("SNOMED SCTID Validator", () => {
    it("validates well-formed SCTIDs with Verhoeff check-digit", () => {
      expect(isValidSctid("73211009")).toBe(true);
      expect(isValidSctid("38341003")).toBe(true);
      expect(isValidSctid("80146002")).toBe(true);
    });

    it("rejects corrupted SCTIDs with wrong check-digit", () => {
      expect(isValidSctid("73211008")).toBe(false);
      expect(isValidSctid("73211000")).toBe(false);
      expect(isValidSctid("38341004")).toBe(false);
    });
  });
});
