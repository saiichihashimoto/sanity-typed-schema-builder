import { faker } from "@faker-js/faker";
import { describe, expect, it } from "@jest/globals";
import { z } from "zod";

import { mockRule } from "../test-utils";

import { date } from ".";

import type { ValidateShape } from "../test-utils";
import type {
  InferParsedValue,
  InferResolvedValue,
  InferValue,
} from "../types";

describe("date", () => {
  it("builds a sanity config", () =>
    expect(date().schema()).toEqual({
      type: "date",
    }));

  it("passes through schema values", () =>
    expect(date({ hidden: false }).schema()).toHaveProperty("hidden", false));

  it("parses into a string", () => {
    const type = date();

    const value: ValidateShape<InferValue<typeof type>, string> = "2017-02-12";
    const parsedValue: ValidateShape<
      InferParsedValue<typeof type>,
      string
    > = type.parse(value);

    expect(parsedValue).toEqual(value);
  });

  it("resolves into a string", () => {
    const type = date();

    const value: ValidateShape<InferValue<typeof type>, string> = "2017-02-12";
    const resolvedValue: ValidateShape<
      InferResolvedValue<typeof type>,
      string
    > = type.resolve(value);

    expect(resolvedValue).toEqual(value);
  });

  it("mocks a string", () => {
    const value = date().mock(faker);

    expect(value).toEqual(expect.any(String));

    z.string()
      .regex(/^\d\d\d\d-\d\d-\d\d$/)
      .parse(value);
  });

  it("mocks the same value with the same path", () => {
    expect(date().mock(faker)).toEqual(date().mock(faker));
    expect(date().mock(faker, ".foo")).toEqual(date().mock(faker, ".foo"));

    expect(date().mock(faker, ".foo")).not.toEqual(date().mock(faker));
    expect(date().mock(faker)).not.toEqual(date().mock(faker, ".foo"));
  });

  it("allows defining the mocks", () =>
    expect(["2010-05-06", "2011-04-27"]).toContainEqual(
      date({
        mock: (faker) =>
          faker.helpers.arrayElement(["2010-05-06", "2011-04-27"]),
      }).mock(faker)
    ));

  it("allows defining the zod", () => {
    const type = date({
      zod: (zod) => zod.transform((value) => value.length),
    });

    const parsedValue: ValidateShape<
      InferParsedValue<typeof type>,
      number
    > = type.parse("2017-02-12");

    expect(parsedValue).toEqual(10);
  });

  it("types custom validation", () => {
    const type = date({
      validation: (Rule) =>
        Rule.custom((value) => {
          const date: ValidateShape<typeof value, string | undefined> = value;

          return (date?.length ?? 0) > 50 || "Needs to be 50 characters";
        }),
    });

    const rule = mockRule();

    type.schema().validation?.(rule);

    expect(rule.custom).toHaveBeenCalledWith(expect.any(Function));
  });
});
