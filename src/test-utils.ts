import type { Resolve } from "./types";
import type { Rule } from "@sanity/types";

type ValidateError<T, Shape> = Resolve<{
  expected: Resolve<Shape>;
  received: Resolve<T>;
}>;

export type ValidateShape<Received, Expected> = (<T>() => T extends Received
  ? 1
  : 2) extends <T>() => T extends Expected ? 1 : 2
  ? Received
  : ValidateError<Received, Expected>;

export const mockRule = (): Rule => {
  const rule = {
    _fieldRules: undefined,
    _level: undefined,
    _message: undefined,
    _required: undefined,
    _rules: [],
    _type: undefined,
    _typeDef: undefined,
    all: () => mockRule(),
    assetRequired: () => rule,
    block: () => rule,
    clone: () => mockRule(),
    cloneWithRules: () => mockRule(),
    custom: () => rule,
    either: () => mockRule(),
    email: () => rule,
    error: () => rule,
    fields: () => rule,
    greaterThan: () => rule,
    info: () => rule,
    integer: () => rule,
    isRequired: () => true,
    length: () => rule,
    lessThan: () => rule,
    lowercase: () => rule,
    max: () => rule,
    merge: () => mockRule(),
    min: () => rule,
    negative: () => rule,
    optional: () => rule,
    positive: () => rule,
    precision: () => rule,
    reference: () => rule,
    regex: () => rule,
    required: () => rule,
    reset: () => rule,
    type: () => rule,
    unique: () => rule,
    uppercase: () => rule,
    uri: () => rule,
    valid: () => rule,
    validate: async () => Promise.resolve([]),
    valueOfField: () => ({ type: Symbol("Mock Value"), path: [] }),
    warning: () => rule,
  };

  return rule;
};
