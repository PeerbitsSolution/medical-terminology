# Licensing

**Read this before assuming any terminology content is included — link
prominently from README.md's introduction (handover doc §11). This is a
legal notice as much as a scope document.**

| System | Licensing posture | What this repo ships |
|---|---|---|
| ICD-10-CM | Public domain (US, CMS/NCHS) | Format validation + small illustrative example set |
| LOINC | Free to use/redistribute under the Regenstrief LOINC License, with required attribution | Format validation + small illustrative set, attribution notice included |
| UCUM | Open, free to use/redistribute with copyright notice (Regenstrief) | Syntax validation, referenced directly |
| SNOMED CT | Requires a SNOMED International national affiliate license | Checksum (SCTID) validation ONLY — no code-to-concept content |
| RxNorm | Requires a UMLS Metathesaurus License Agreement | Format validation ONLY — no code-to-concept content |
| CPT | AMA copyright — cannot be redistributed even partially without a paid license | NOTHING. Format-shape check only (5-digit pattern), zero real codes or descriptions, permanently |

## If your team needs real lookup for a license-gated system
Use the pluggable `TerminologyProvider` interface (`src/provider.ts`) to
plug in your own licensed access — a real SNOMED/RxNorm database you
already have proper access to, or a terminology server. This repo does
not and will not ship an implementation for SNOMED, RxNorm, or CPT.

## Before publishing this repo
This document is engineering-level licensing research, not legal advice.
Get an actual sign-off from whoever handles IP/licensing at Peerbits
before this repo's first public push — see handover doc §15.
