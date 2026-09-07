import { describe, expect, it } from 'vitest';
import { canonicalizeSystemIdentifier, validate, validateMany } from '../src/index.js';

describe('vitals pipeline integration helpers', () => {
  it('canonicalizes URI, short-name, and OID identifiers', () => {
    expect(canonicalizeSystemIdentifier('loinc')).toBe('http://loinc.org');
    expect(canonicalizeSystemIdentifier('2.16.840.1.113883.6.8')).toBe('http://unitsofmeasure.org');
  });

  it('can reject unknown systems at a strict ingestion boundary', () => {
    expect(validate({ system: 'https://unknown.example/codes', code: 'x' }).valid).toBe(true);
    expect(validate({ system: 'https://unknown.example/codes', code: 'x' }, { unknownSystem: 'error' }).valid).toBe(false);
  });

  it('validates a batch of LOINC and UCUM concepts', () => {
    const results = validateMany([
      { system: 'http://loinc.org', code: '99504-3' },
      { system: 'http://unitsofmeasure.org', code: 'mg/dL' },
    ], { unknownSystem: 'error' });
    expect(results.every((result) => result.valid)).toBe(true);
  });
});
