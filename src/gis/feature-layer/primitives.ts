/**
 * Feature-layer primitives — public facade.
 *
 * Implementation lives in cohesive modules; this file keeps the historical
 * import path stable for every caller:
 * - region-names:   viloyat codes/aliases and title/url haystack matching
 * - where-values:   filter model, spelling variants, value index, field kinds
 * - layer-tree:     live layer classification, parents, scale gates, guards
 * - detached-query: off-map FeatureLayers, token registration, module loaders
 * - query-cache:    query URLs, shared caches, extent validation, debug log
 */
export * from "./region-names";
export * from "./where-values";
export * from "./layer-tree";
export * from "./detached-query";
export * from "./query-cache";
