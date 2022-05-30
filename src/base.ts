export interface SanityType<Value, Definition> {
  _value: Value;
  schema: () => Definition;
}

export type InferValue<T extends SanityType<any, any>> = T extends SanityType<
  infer Type,
  any
>
  ? Type
  : never;

export type InferDefinition<T extends SanityType<any, any>> =
  T extends SanityType<any, infer Definition> ? Definition : never;
