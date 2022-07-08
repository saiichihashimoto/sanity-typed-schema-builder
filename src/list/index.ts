import { flow, isObject, map } from "lodash/fp";

import type { Faker } from "@faker-js/faker";
import type { Merge } from "type-fest";

type ListValue<T> = T | { title: string; value: T };

export type WithTypedOptionsList<
  Value,
  T extends {
    options?: {
      list?: Array<ListValue<any>>;
    };
  }
> = Merge<
  T,
  {
    options?: Merge<
      T["options"],
      {
        list?: Array<ListValue<Value>>;
      }
    >;
  }
>;

export const listValueToValue = <T>(item: ListValue<T>) =>
  isObject(item) && "title" in item && "value" in item ? item.value : item;

export const listMock =
  <Input>(list: Array<ListValue<Input>>) =>
  (faker: Faker) =>
    flow(
      map(listValueToValue),
      faker.helpers.arrayElement.bind(faker.helpers)
    )(list);
