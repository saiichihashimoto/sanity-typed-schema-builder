import type { ValidationBuilder } from "sanity";

export type TupleOfLength<
  T,
  Min extends number = number,
  Max extends number = number,
  Result extends T[] = []
> = Result["length"] extends Min
  ? number extends Max
    ? [...Result, ...T[]]
    : Result["length"] extends Max
    ? Result
    :
        | Result
        | TupleOfLength<
            T,
            [T, ...Result]["length"] & number,
            Max,
            [T, ...Result]
          >
  : TupleOfLength<T, Min, Max, [T, ...Result]>;

export type GetRule<T> = T extends {
  validation?: ValidationBuilder<infer Rule, any>;
}
  ? Rule
  : never;

// };

export type NamedSchemaFields = "description" | "name" | "title";
