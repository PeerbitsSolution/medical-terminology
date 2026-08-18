import { beforeEach, describe, expect, it } from "vitest";
import {
  clearProviders,
  getRegisteredProviderSystems,
  hasProvider,
  lookup,
  registerProvider,
  unregisterProvider,
  validateWithProvider,
} from "../src/index.js";

describe("medical-terminology: Pluggable Terminology Providers", () => {
  beforeEach(() => {
    clearProviders();
  });

  it("registers and dispatches a provider by shortName", async () => {
    registerProvider("loinc", async (code) => {
      return { found: code === "8867-4", display: "Heart rate" };
    });

    expect(hasProvider("loinc")).toBe(true);
    expect(hasProvider("http://loinc.org")).toBe(true);
    expect(getRegisteredProviderSystems()).toContain("http://loinc.org");

    const result = await lookup("http://loinc.org", "8867-4", {
      system: "http://loinc.org",
      code: "8867-4",
    });

    expect(result?.found).toBe(true);
    expect(result?.display).toBe("Heart rate");
  });

  it("registers and dispatches a provider by canonical URI", async () => {
    registerProvider("http://snomed.info/sct", (code) => {
      return { found: code === "73211009" };
    });

    expect(hasProvider("snomed")).toBe(true);
    const result = await lookup("snomed", "73211009", {
      system: "http://snomed.info/sct",
      code: "73211009",
    });

    expect(result?.found).toBe(true);
  });

  it("unregisters providers cleanly", () => {
    registerProvider("loinc", () => ({ found: true }));
    expect(hasProvider("loinc")).toBe(true);

    const unregistered = unregisterProvider("loinc");
    expect(unregistered).toBe(true);
    expect(hasProvider("loinc")).toBe(false);

    // Unregistering nonexistent provider returns false
    expect(unregisterProvider("unknown-system")).toBe(false);
  });

  it("clears all registered providers", () => {
    registerProvider("loinc", () => ({ found: true }));
    registerProvider("snomed", () => ({ found: true }));
    expect(getRegisteredProviderSystems()).toHaveLength(2);

    clearProviders();
    expect(getRegisteredProviderSystems()).toHaveLength(0);
    expect(hasProvider("loinc")).toBe(false);
    expect(hasProvider("snomed")).toBe(false);
  });

  it("throws TypeError on invalid registration arguments", () => {
    expect(() => {
      // @ts-expect-error - testing invalid args
      registerProvider(null, () => ({ found: true }));
    }).toThrow(TypeError);

    expect(() => {
      registerProvider("invalid-sys", () => ({ found: true }));
    }).toThrow(TypeError);

    expect(() => {
      // @ts-expect-error - testing invalid provider fn
      registerProvider("loinc", null);
    }).toThrow(TypeError);
  });

  it("integrates seamlessly into validateWithProvider flow", async () => {
    registerProvider("loinc", async (code) => {
      return {
        found: code === "8867-4",
        message: code === "8867-4" ? undefined : "Code not in local database",
      };
    });

    // Found case
    const foundRes = await validateWithProvider({
      system: "http://loinc.org",
      code: "8867-4",
    });
    expect(foundRes.valid).toBe(true);
    expect(foundRes.issues).toHaveLength(0);

    // Not found case (format valid, provider not found)
    const notFoundRes = await validateWithProvider({
      system: "http://loinc.org",
      code: "12345-6",
    });
    expect(notFoundRes.valid).toBe(true);
    expect(notFoundRes.issues).toHaveLength(1);
    expect(notFoundRes.issues[0].code).toBe("provider-not-found");
    expect(notFoundRes.issues[0].severity).toBe("warning");
  });
});
