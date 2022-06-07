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

export const mockRule = () => {
  const rule: Rule = {
    _fieldRules: undefined,
    _level: undefined,
    _message: undefined,
    _required: undefined,
    _rules: [],
    _type: undefined,
    _typeDef: undefined,
    all: jest.fn(() => mockRule()),
    assetRequired: jest.fn(() => rule),
    block: jest.fn(jest.fn(() => rule)),
    clone: jest.fn(() => mockRule()),
    cloneWithRules: jest.fn(() => mockRule()),
    custom: jest.fn(() => rule),
    either: jest.fn(() => mockRule()),
    email: jest.fn(() => rule),
    error: jest.fn(() => rule),
    fields: jest.fn(() => rule),
    greaterThan: jest.fn(() => rule),
    info: jest.fn(() => rule),
    integer: jest.fn(() => rule),
    isRequired: jest.fn(() => true),
    length: jest.fn(() => rule),
    lessThan: jest.fn(() => rule),
    lowercase: jest.fn(() => rule),
    max: jest.fn(() => rule),
    merge: jest.fn(() => mockRule()),
    min: jest.fn(() => rule),
    negative: jest.fn(() => rule),
    optional: jest.fn(() => rule),
    positive: jest.fn(() => rule),
    precision: jest.fn(() => rule),
    reference: jest.fn(() => rule),
    regex: jest.fn(() => rule),
    required: jest.fn(() => rule),
    reset: jest.fn(() => rule),
    type: jest.fn(() => rule),
    unique: jest.fn(() => rule),
    uppercase: jest.fn(() => rule),
    uri: jest.fn(() => rule),
    valid: jest.fn(() => rule),
    validate: jest.fn(async () => Promise.resolve([])),
    valueOfField: jest.fn(() => ({ type: Symbol("Mock Value"), path: [] })),
    warning: jest.fn(() => rule),
  };

  return rule;
};
