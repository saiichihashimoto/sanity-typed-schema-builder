import type { Resolve } from "./types";

type ValidateError<T, Shape> = Resolve<{
  expected: Shape;
  received: T;
}>;

export type ValidateShape<Received, Expected> = Received extends Expected
  ? Expected extends Received
    ? Received
    : ValidateError<Received, Expected>
  : ValidateError<Received, Expected>;
