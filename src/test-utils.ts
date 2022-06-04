import type { Resolve } from "./types";

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
  const rule = {
    custom: () => rule,
    error: () => rule,
    greaterThan: () => rule,
    integer: () => rule,
    length: () => rule,
    lessThan: () => rule,
    lowercase: () => rule,
    max: () => rule,
    min: () => rule,
    negative: () => rule,
    positive: () => rule,
    precision: () => rule,
    regex: () => rule,
    required: () => rule,
    unique: () => rule,
    uppercase: () => rule,
    uri: () => rule,
    valueOfField: () => undefined,
    warning: () => rule,
  };

  return rule;
};
