// Vitest doesn't have Next.js's special handling of the `server-only`
// package (which throws when imported from client code); this stub is
// aliased over it in vitest.config.ts so server-only modules stay testable.
export {};
