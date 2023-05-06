import { faker } from "@faker-js/faker";
import { describe, expect, it } from "@jest/globals";
import { s } from "@sanity-typed/schema-builder";
import type { GeopointValue } from "sanity";

import { mockRule } from "../test-utils";
import type { Equal, Expect } from "../test-utils";

describe("geopoint", () => {
  it("builds a sanity config", () =>
    expect(s.geopoint().schema()).toStrictEqual({
      type: "geopoint",
    }));

  it("passes through schema values", () =>
    expect(s.geopoint({ hidden: false }).schema()).toHaveProperty(
      "hidden",
      false
    ));

  it("parses into a geopoint", () => {
    const type = s.geopoint();

    const value = {
      _type: "geopoint",
      lat: 58.63169011423141,
      lng: 9.089101352587932,
      alt: 13.37,
    } as s.infer<typeof type>;
    const parsedValue = type.parse(value);

    type Assertions = [
      Expect<Equal<typeof value, GeopointValue>>,
      Expect<Equal<typeof parsedValue, GeopointValue>>
    ];

    expect(parsedValue).toStrictEqual(value);
  });

  it("resolves into a geopoint", () => {
    const type = s.geopoint();

    const value = {
      _type: "geopoint",
      lat: 58.63169011423141,
      lng: 9.089101352587932,
      alt: 13.37,
    } as s.infer<typeof type>;
    const resolvedValue = type.resolve(value);

    type Assertions = [
      Expect<Equal<typeof value, GeopointValue>>,
      Expect<Equal<typeof resolvedValue, GeopointValue>>
    ];

    expect(resolvedValue).toStrictEqual(value);
  });

  it("mocks a geopoint", () =>
    expect(s.geopoint().mock(faker)).toStrictEqual({
      _type: "geopoint",
      lat: expect.any(Number),
      lng: expect.any(Number),
      alt: expect.any(Number),
    }));

  it("mocks the same value with the same path", () => {
    expect(s.geopoint().mock(faker)).toStrictEqual(s.geopoint().mock(faker));
    expect(s.geopoint().mock(faker, ".foo")).toStrictEqual(
      s.geopoint().mock(faker, ".foo")
    );

    expect(s.geopoint().mock(faker, ".foo")).not.toStrictEqual(
      s.geopoint().mock(faker)
    );
    expect(s.geopoint().mock(faker)).not.toStrictEqual(
      s.geopoint().mock(faker, ".foo")
    );
  });

  it("allows defining the mocks", () =>
    expect([
      {
        _type: "geopoint",
        lat: 58.63169011423141,
        lng: 9.089101352587932,
        alt: 13.37,
      },
      {
        _type: "geopoint",
        lat: -58.63169011423141,
        lng: -9.089101352587932,
        alt: 12.37,
      },
    ]).toContainEqual(
      s
        .geopoint({
          mock: (faker) =>
            faker.helpers.arrayElement([
              {
                _type: "geopoint",
                lat: 58.63169011423141,
                lng: 9.089101352587932,
                alt: 13.37,
              },
              {
                _type: "geopoint",
                lat: -58.63169011423141,
                lng: -9.089101352587932,
                alt: 12.37,
              },
            ]),
        })
        .mock(faker)
    ));

  it("allows defining the zod", () => {
    const type = s.geopoint({
      zod: (zod) => zod.transform(({ lat }) => lat),
    });

    const parsedValue = type.parse({
      _type: "geopoint",
      lat: 58.63169011423141,
      lng: 9.089101352587932,
      alt: 13.37,
    });

    type Assertions = [Expect<Equal<typeof parsedValue, number>>];

    expect(parsedValue).toBe(58.63169011423141);
  });

  it("types custom validation", () => {
    const type = s.geopoint({
      validation: (Rule) =>
        Rule.custom((value) => {
          type Assertions = [
            Expect<Equal<typeof value, GeopointValue | undefined>>
          ];

          return (value?.lat ?? 0) > 50 || "Needs to be greater than 50";
        }),
    });

    const rule = mockRule();

    type.schema().validation?.(rule);

    expect(rule.custom).toHaveBeenCalledWith(expect.any(Function));
  });
});
