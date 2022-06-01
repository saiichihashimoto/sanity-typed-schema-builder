type OnlyOptionalFromUndefined<T> = {
  [K in keyof T as undefined extends T[K] ? K : never]?: T[K];
};

export type OptionalFromUndefined<T> = Omit<
  T,
  keyof OnlyOptionalFromUndefined<T>
> &
  OnlyOptionalFromUndefined<T>;
