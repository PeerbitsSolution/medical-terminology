import { getSystemByIdentifier } from "./registry.js";
import type {
  CodedConcept,
  ProviderLookupResult,
  TerminologyProvider,
} from "./types.js";

const providers = new Map<string, TerminologyProvider>();

export function registerProvider(
  system: string,
  provider: TerminologyProvider
): void {
  if (typeof system !== "string") {
    throw new TypeError("Provider registration requires a string system identifier.");
  }
  const s = getSystemByIdentifier(system);
  if (!s) {
    throw new TypeError(
      `Cannot register provider for unknown system identifier: "${system}".`
    );
  }
  if (typeof provider !== "function") {
    throw new TypeError("Provider must be a function.");
  }
  providers.set(s.uri, provider);
}

export function unregisterProvider(system: string): boolean {
  if (typeof system !== "string") return false;
  const s = getSystemByIdentifier(system);
  return s ? providers.delete(s.uri) : false;
}

export function clearProviders(): void {
  providers.clear();
}

export function getRegisteredProviderSystems(): readonly string[] {
  return Object.freeze([...providers.keys()]);
}

export function hasProvider(system: string): boolean {
  if (typeof system !== "string") return false;
  const s = getSystemByIdentifier(system);
  return !!s && providers.has(s.uri);
}

export async function lookup(
  system: string,
  code: string,
  concept: Readonly<CodedConcept>
): Promise<ProviderLookupResult | undefined> {
  if (typeof system !== "string" || typeof code !== "string") return undefined;
  const s = getSystemByIdentifier(system);
  const fn = s ? providers.get(s.uri) : undefined;
  if (!fn) return undefined;
  return await fn(code, concept);
}
