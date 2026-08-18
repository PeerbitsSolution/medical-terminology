import { describe, expect, it } from "vitest";
import {
  calculateSctidCheckDigit,
  isValidSctid,
} from "../src/index.js";

describe("medical-terminology: SNOMED CT SCTID Verhoeff Checksum", () => {
  it("computes accurate Verhoeff check digits for known SCTID test vectors", () => {
    // Official test vectors for Verhoeff check-digit algorithm
    const vectors: [string, string][] = [
      ["7321100", "9"], // Diabetes mellitus (73211009)
      ["3834100", "3"], // Hypertensive disorder (38341003)
      ["8014600", "2"], // Appendectomy (80146002)
      ["26703600", "7"], // Dyspnea (267036007)
      ["2229800", "6"], // Myocardial infarction (22298006)
      ["1", "5"],
      ["12", "1"],
      ["123", "3"],
      ["1234", "0"],
      ["12345", "1"],
      ["142857", "0"],
      ["8473643", "6"],
    ];

    for (const [body, expectedDigit] of vectors) {
      expect(calculateSctidCheckDigit(body)).toBe(expectedDigit);
      expect(isValidSctid(body + expectedDigit)).toBe(true);
    }
  });

  it("detects all single-digit transcription errors", () => {
    const body = "7321100";
    const correctCheck = calculateSctidCheckDigit(body)!;
    expect(correctCheck).toBe("9");

    // Alter each digit in the body from 0-9
    for (let i = 0; i < body.length; i++) {
      const originalDigit = Number(body[i]);
      for (let substitute = 0; substitute <= 9; substitute++) {
        if (substitute === originalDigit) continue;
        const mutatedBody =
          body.slice(0, i) + substitute + body.slice(i + 1);
        const mutatedSctid = mutatedBody + correctCheck;
        // Check digit will not match the mutated body
        expect(isValidSctid(mutatedSctid)).toBe(false);
      }
    }
  });

  it("detects adjacent digit transposition errors", () => {
    const body = "7321100";
    const correctCheck = calculateSctidCheckDigit(body)!;

    for (let i = 0; i < body.length - 1; i++) {
      if (body[i] === body[i + 1]) continue;
      const transposedBody =
        body.slice(0, i) +
        body[i + 1] +
        body[i] +
        body.slice(i + 2);
      expect(isValidSctid(transposedBody + correctCheck)).toBe(false);
    }
  });

  it("rejects non-numeric, empty, or out-of-range SCTID inputs", () => {
    expect(calculateSctidCheckDigit("")).toBeUndefined();
    expect(calculateSctidCheckDigit("abc")).toBeUndefined();
    expect(calculateSctidCheckDigit("12-34")).toBeUndefined();
    expect(calculateSctidCheckDigit("1".repeat(18))).toBeUndefined(); // >17 body digits
    expect(isValidSctid("")).toBe(false);
    expect(isValidSctid("1")).toBe(false); // < 2 digits total
    expect(isValidSctid("1".repeat(19))).toBe(false); // > 18 digits total
  });
});
