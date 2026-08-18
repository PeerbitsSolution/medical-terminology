# @peerbits/medical-terminology

> Terminology system-URI registry and code format/checksum validation utilities — ships zero licensed terminology datasets (see [Licensing](./docs/LICENSING.md))

**Category:** Medical Coding — Terminology & Code-Handling Utilities · **License:** Apache-2.0 · **Status:** Stable

[![CI](https://github.com/PeerbitsSolution/medical-terminology/actions/workflows/ci.yml/badge.svg)](https://github.com/PeerbitsSolution/medical-terminology/actions/workflows/ci.yml)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](LICENSE)
[![npm version](https://img.shields.io/npm/v/@peerbits/medical-terminology.svg)](https://www.npmjs.com/package/@peerbits/medical-terminology)

---

## 1. What problem does this solve?

Healthcare applications regularly handle coded concepts across disparate medical terminology systems—LOINC, SNOMED CT, ICD-10-CM, RxNorm, CPT, and UCUM. Validating these concepts in ingestion pipelines typically forces teams to either deploy heavy terminology servers (like Ontoserver or UMLS TS) or omit validation entirely, allowing malformed identifiers and invalid URIs to corrupt downstream FHIR records.

`@peerbits/medical-terminology` provides a zero-dependency, in-memory validation engine that standardizes canonical system URIs and validates code syntax, pattern structures, and Verhoeff check-digits client-side, with an optional pluggable provider architecture for teams that connect real terminology services.

> **⚠️ Licensing Note:** This repository ships canonical code-system URI metadata and structural format/checksum validators only. It does **not** include or distribute any proprietary CPT, SNOMED CT, or RxNorm concept datasets. See [docs/LICENSING.md](./docs/LICENSING.md) for full compliance details.

---

## 2. Features

- **Canonical System URI Registry**: Standardized URIs, OIDs, and short-names for 6 major medical coding systems:
  - **LOINC** (`http://loinc.org`)
  - **SNOMED CT** (`http://snomed.info/sct`)
  - **ICD-10-CM** (`http://hl7.org/fhir/sid/icd-10-cm`)
  - **RxNorm** (`http://www.nlm.nih.gov/research/umls/rxnorm`)
  - **CPT** (`http://www.ama-assn.org/go/cpt`)
  - **UCUM** (`http://unitsofmeasure.org`)
- **Fast Structural & Checksum Validation**:
  - Full Verhoeff check-digit calculation and validation for SNOMED SCTIDs.
  - RegEx & structural format validation for LOINC, ICD-10-CM, CPT (5-digit syntax), RxNorm (RxCUI numeric format), and UCUM syntax.
- **Pluggable Provider Architecture**: Register runtime lookup hooks (e.g., UMLS REST API, local Terminology Server) to augment structural checks with real-time concept validation.
- **Zero Runtime Dependencies**: Pure TypeScript with zero external network or database requirements.

---

## 3. Installation

```bash
npm install @peerbits/medical-terminology
```

---

## 4. Quick Start

```ts
import { validate, SYSTEM_REGISTRY, isValidSctid } from "@peerbits/medical-terminology";

// 1. Validate a LOINC observation code
const loincResult = validate({
  system: "http://loinc.org",
  code: "8867-4",
});
console.log(loincResult.valid); // true

// 2. Validate SNOMED CT Concept ID with Verhoeff check-digit
const snomedResult = validate({
  system: "http://snomed.info/sct",
  code: "73211009", // Diabetes mellitus
});
console.log(snomedResult.valid); // true

// 3. Catch invalid formats early
const invalidResult = validate({
  system: "http://hl7.org/fhir/sid/icd-10-cm",
  code: "INVALID_CODE",
});
console.log(invalidResult.valid); // false
console.log(invalidResult.issues);
// [ { severity: "error", path: "code", code: "invalid-format", message: "..." } ]
```

---

## 5. Pluggable Terminology Providers

You can register custom terminology lookup providers to resolve live concepts while falling back gracefully if offline:

```ts
import { registerProvider, validateWithProvider } from "@peerbits/medical-terminology";

// Register an in-house or external terminology resolver
registerProvider("loinc", async (code) => {
  const isFound = await checkLocalDatabase(code);
  return { found: isFound, display: isFound ? "Heart rate" : undefined };
});

// Validate format AND verify existence through the provider
const result = await validateWithProvider({
  system: "http://loinc.org",
  code: "8867-4",
});

console.log(result.valid); // true
```

---

## 6. Architecture

```
src/
├── index.ts              # Package entry point and exports
├── registry.ts           # Canonical URIs, OIDs, and system metadata
├── provider.ts           # Pluggable terminology provider interface
├── types.ts              # TypeScript declarations and error shapes
├── validate.ts           # Unified validation engine
└── validators/
    ├── cpt.ts            # CPT 5-digit format check (Zero dataset content)
    ├── icd10cm.ts        # ICD-10-CM alphanumeric structural check
    ├── loinc.ts          # LOINC hyphenated identifier check
    ├── rxnorm.ts         # RxNorm RxCUI numeric format check
    ├── snomed.ts         # SNOMED CT Verhoeff check-digit algorithm
    └── ucum.ts           # UCUM unit syntax validator
```

---

## 7. Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

---

## 8. License

Apache License 2.0 — see [LICENSE](./LICENSE).

---

## 9. About PeerbitsSolution

`@peerbits/medical-terminology` is part of the [PeerbitsSolution HealthTech Open Source](https://github.com/PeerbitsSolution) initiative—reusable engineering components extracted from our healthcare technology work. This repository contains generalized, reusable logic only; it is not tied to any specific client engagement or commercial product.
