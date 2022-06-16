import { isObject } from "lodash/fp";

import type { Faker } from "@faker-js/faker";

export type WithTypedOptionsList<
  Value,
  T extends {
    options?: { list?: Array<any | { title: string; value: any }> };
  }
> = Omit<T, "options"> & {
  options?: Omit<T["options"], "list"> & {
    list?: Array<Value | { title: string; value: Value }>;
  };
};

type List<T> = Array<T | { title: string; value: T }>;

export const listToListValues = <T>(list: List<T>) =>
  list.map((item) =>
    isObject(item) && "title" in item && "value" in item ? item.value : item
  );

export const listMock =
  <Input>(
    list: List<Input> | undefined,
    mock: (faker: Faker, path: string) => Input
  ) =>
  (faker: Faker, path: string) =>
    !list?.length
      ? mock(faker, path)
      : faker.helpers.arrayElement(listToListValues<Input>(list));
