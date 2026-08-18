import { describe, expect, it } from "vitest";
import {
  validate,
  validateWithProvider,
  registerProvider,
  clearProviders,
  isValidSctid,
  calculateSctidCheckDigit,
} from "../src/index.js";

describe("medical-terminology: Adversarial Edge Cases & Stress Tests", () => {
  describe("Primitive, Non-Object, & Poisoned Inputs", () => {
    it("safely rejects non-object inputs without crashing", () => {
      const primitives = [
        null,
        undefined,
        0,
        -1,
        42,
        NaN,
        Infinity,
        -Infinity,
        "",
        "   ",
        "some-string",
        true,
        false,
        [],
        [1, 2, 3],
        [{ system: "http://loinc.org", code: "8867-4" }],
        () => {},
        Symbol("concept"),
        BigInt(12345),
        new Date(),
        /regex-pattern/,
        new Uint8Array([1, 2, 3]),
      ];

      for (const input of primitives) {
        expect(() => {
          const res = validate(input);
          expect(res.valid).toBe(false);
          expect(res.issues.length).toBeGreaterThan(0);
          expect(res.providerConfigured).toBe(false);
        }).not.toThrow();
      }
    });

    it("survives prototype pollution attacks without polluting Object prototype", () => {
      const maliciousPayload = JSON.parse(
        '{"system": "http://loinc.org", "code": "8867-4", "__proto__": {"polluted": true, "admin": true}}'
      );

      const res = validate(maliciousPayload);
      expect(res.valid).toBe(true);
      expect((Object.prototype as Record<string, unknown>).polluted).toBeUndefined();
      expect((Object.prototype as Record<string, unknown>).admin).toBeUndefined();
    });

    it("survives constructor, toString, and valueOf override traps", () => {
      const maliciousObject = {
        system: "http://loinc.org",
        code: "8867-4",
        constructor: { prototype: { evil: true } },
        toString: "not a function",
        valueOf: () => {
          throw new Error("valueOf trap triggered");
        },
      };

      expect(() => {
        const res = validate(maliciousObject);
        expect(res.valid).toBe(true);
      }).not.toThrow();
    });

    it("safely handles objects with throwing getters without uncaught exceptions", () => {
      const explosiveObject = {
        get system(): string {
          throw new Error("Boom in system getter");
        },
        get code(): string {
          throw new Error("Boom in code getter");
        },
      };

      expect(() => {
        const res = validate(explosiveObject);
        expect(res.valid).toBe(false);
        expect(res.issues.some((i) => i.code === "required")).toBe(true);
      }).not.toThrow();
    });

    it("safely validates Object.create(null) dictionary concepts", () => {
      const nullProto: Record<string, string> = Object.create(null);
      nullProto.system = "http://loinc.org";
      nullProto.code = "8867-4";

      const res = validate(nullProto);
      expect(res.valid).toBe(true);
      expect(res.issues).toHaveLength(0);
    });

    it("safely handles Object.freeze and Object.seal instances", () => {
      const frozen = Object.freeze({
        system: "http://loinc.org",
        code: "8867-4",
      });

      const res = validate(frozen);
      expect(res.valid).toBe(true);
    });
  });

  describe("String Bomb, Unicode, & Control Character Stress Tests", () => {
    it("handles 1MB oversized strings without memory exhaustion or regex catastrophies", () => {
      const massiveCode = "9".repeat(1_000_000);
      const massiveSystem = "http://example.org/" + "a".repeat(1_000_000);

      const res = validate({
        system: "http://loinc.org",
        code: massiveCode,
      });

      expect(res.valid).toBe(false);
      expect(res.issues.some((i) => i.code === "invalid-format")).toBe(true);

      const resUnknown = validate({
        system: massiveSystem,
        code: "123",
      });
      expect(resUnknown.valid).toBe(true);
      expect(resUnknown.issues[0].code).toBe("unknown-system");
    });

    it("safely handles null bytes, control characters, and RTL unicode in code fields", () => {
      const adversarialCodes = [
        "8867-4\0",
        "8867-4\u0000",
        "\u202E8867-4", // RTL override
        "8867\u200B-4", // Zero-width space
        "8867-4\r\n\t",
        "🩺-4",
        "❤️",
        "‎8867-4",
      ];

      for (const code of adversarialCodes) {
        expect(() => {
          const res = validate({ system: "http://loinc.org", code });
          expect(typeof res.valid).toBe("boolean");
        }).not.toThrow();
      }
    });

    it("handles SCTID adversarial check-digit inputs without crashing", () => {
      const invalidSctids = [
        "",
        " ",
        "-12345",
        "1e10",
        "NaN",
        "Infinity",
        "123456789012345678901234567890", // > 18 digits
        "abc",
        "12.34",
        null as unknown as string,
        undefined as unknown as string,
      ];

      for (const s of invalidSctids) {
        expect(isValidSctid(s)).toBe(false);
        expect(calculateSctidCheckDigit(s)).toBeUndefined();
      }
    });
  });

  describe("Provider Adversarial & Fault-Tolerance Tests", () => {
    it("safely handles a provider that throws synchronous exceptions", async () => {
      clearProviders();
      registerProvider("loinc", () => {
        throw new Error("Synchronous database crash");
      });

      const res = await validateWithProvider({
        system: "http://loinc.org",
        code: "8867-4",
      });

      expect(res.valid).toBe(true); // format check remains valid
      expect(res.issues.some((i) => i.code === "provider-failed")).toBe(true);
    });

    it("safely handles a provider that rejects asynchronous promises", async () => {
      clearProviders();
      registerProvider("snomed", async () => {
        return Promise.reject(new Error("Async network timeout"));
      });

      const res = await validateWithProvider({
        system: "http://snomed.info/sct",
        code: "73211009",
      });

      expect(res.valid).toBe(true);
      expect(res.issues.some((i) => i.code === "provider-failed")).toBe(true);
    });

    it("safely handles a provider that returns non-conforming responses", async () => {
      clearProviders();
      registerProvider("rxnorm", (() => {
        return null as unknown as { found: boolean };
      }) as unknown as Parameters<typeof registerProvider>[1]);

      const res = await validateWithProvider({
        system: "http://www.nlm.nih.gov/research/umls/rxnorm",
        code: "123456",
      });

      expect(res.valid).toBe(true);
    });

    it("safely handles 100 concurrent validation calls under loaded async provider", async () => {
      clearProviders();
      let callCount = 0;
      registerProvider("loinc", async (code) => {
        callCount++;
        await new Promise((r) => setTimeout(r, 2));
        return { found: code === "8867-4" };
      });

      const promises = Array.from({ length: 100 }, (_, i) =>
        validateWithProvider({
          system: "http://loinc.org",
          code: i % 2 === 0 ? "8867-4" : "12345-6",
        })
      );

      const results = await Promise.all(promises);
      expect(results).toHaveLength(100);
      expect(callCount).toBe(100);
    });
  });
});
