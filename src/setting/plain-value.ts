/**
 * Setting-side entry for the seamless-immutable helpers. The implementation
 * lives in shared/agri-plain-object.ts so runtime, setting and shared code
 * use one copy.
 */
export {
  hasAsMutable,
  toPlainArray,
  toPlainDeep,
} from "../shared/agri-plain-object";
export type { AsMutableCapable } from "../shared/agri-plain-object";
