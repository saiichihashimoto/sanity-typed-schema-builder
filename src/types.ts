import type { ZodType } from "zod";

export interface SanityType<
  Definition extends FieldDef<any, any>,
  Input,
  Output = Input
> {
  parse: (data: unknown) => Output;
  schema: () => Definition;
  zod: ZodType<Output, any, Input>;
}

export type InferInput<T extends SanityType<any, any, any>> =
  T extends SanityType<any, infer Input, any> ? Input : never;

export type InferOutput<T extends SanityType<any, any, any>> =
  T extends SanityType<any, any, infer Output> ? Output : never;

type Resolve<T> = T extends (...args: any[]) => any
  ? T
  : T extends abstract new (...args: any[]) => any
  ? T
  : { [K in keyof T]: T[K] };

type OptionalKeys<T extends object> = {
  [k in keyof T]: undefined extends T[k] ? k : never;
}[keyof T];

type RequiredKeys<T extends object> = {
  [k in keyof T]: undefined extends T[k] ? never : k;
}[keyof T];

export type UndefinedAsOptional<T extends object> = Resolve<
  Partial<Pick<T, OptionalKeys<T>>> & Pick<T, RequiredKeys<T>>
>;
