import type { z } from "zod";

export interface SanityType<
  // TODO Does this need to be strongly typed like this? Can it just be not typed?
  Definition extends
    | FieldDef<any, any>
    | ObjectFieldDef<never, never, string, never>["fields"],
  Zod extends z.ZodType<any, any, any>
> {
  mock: () => z.input<Zod>;
  parse: (data: unknown) => z.infer<Zod>;
  schema: () => Definition;
  zod: Zod;
}

export type InferZod<T extends SanityType<any, any>> = T extends SanityType<
  any,
  infer Zod
>
  ? Zod
  : never;

export type Resolve<T> = T extends (...args: any[]) => any
  ? T
  : T extends abstract new (...args: any[]) => any
  ? T
  : { [K in keyof T]: T[K] };

export type InferInput<T extends SanityType<any, any>> = T extends SanityType<
  any,
  infer Zod
>
  ? Resolve<z.input<Zod>>
  : never;

export type InferOutput<T extends SanityType<any, any>> = T extends SanityType<
  any,
  infer Zod
>
  ? Resolve<z.output<Zod>>
  : never;
