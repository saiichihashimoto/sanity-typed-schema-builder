import { faker } from "@faker-js/faker";
import { describe, expect, it } from "@jest/globals";

import { mockRule } from "../test-utils";

import { datetime } from ".";

import type { ValidateShape } from "../test-utils";
import type { InferParsedValue, InferValue } from "../types";

describe("datetime", () => {
  it("builds a sanity config", () =>
    expect(datetime().schema()).toEqual({
      type: "datetime",
      validation: expect.any(Function),
    }));

  it("passes through schema values", () =>
    expect(datetime({ hidden: false }).schema()).toHaveProperty(
      "hidden",
      false
    ));

  it("parses into a Date", () => {
    const type = datetime();

    const value: ValidateShape<
      InferValue<typeof type>,
      string
    > = "2022-06-03T03:24:55.395Z";
    const parsedValue: ValidateShape<
      InferParsedValue<typeof type>,
      Date
    > = type.parse(value);

    expect(parsedValue).toEqual(new Date(value));
  });

  it("enforces a valid Date", () => {
    const type = datetime();

    const value: ValidateShape<InferValue<typeof type>, string> = "not a date";

    expect(() => {
      type.parse(value);
    }).toThrow("Invalid Date");
  });

  it("sets min", () => {
    const type = datetime({ min: "2022-06-03T03:24:55.394Z" });

    const rule = mockRule();

    type.schema().validation(rule);

    expect(rule.min).toHaveBeenCalledWith("2022-06-03T03:24:55.394Z");

    const value: ValidateShape<
      InferValue<typeof type>,
      string
    > = "2022-06-03T03:24:55.395Z";
    const parsedValue: ValidateShape<
      InferParsedValue<typeof type>,
      Date
    > = type.parse(value);

    expect(parsedValue).toEqual(new Date(value));

    expect(() => {
      type.parse("2022-06-03T03:24:55.390Z");
    }).toThrow("Greater than 2022-06-03T03:24:55.394Z");
  });

  it("sets max", () => {
    const type = datetime({ max: "2022-06-03T03:24:55.396Z" });

    const rule = mockRule();

    type.schema().validation(rule);

    expect(rule.max).toHaveBeenCalledWith("2022-06-03T03:24:55.396Z");

    const value: ValidateShape<
      InferValue<typeof type>,
      string
    > = "2022-06-03T03:24:55.395Z";
    const parsedValue: ValidateShape<
      InferParsedValue<typeof type>,
      Date
    > = type.parse(value);

    expect(parsedValue).toEqual(new Date(value));

    expect(() => {
      type.parse("2022-06-03T03:24:55.399Z");
    }).toThrow("Less than 2022-06-03T03:24:55.396Z");
  });

  it("min & max are inclusive", () => {
    const type = datetime({
      max: "2022-06-03T03:24:55.395Z",
      min: "2022-06-03T03:24:55.395Z",
    });

    const rule = mockRule();

    type.schema().validation(rule);

    expect(rule.min).toHaveBeenCalledWith("2022-06-03T03:24:55.395Z");
    expect(rule.max).toHaveBeenCalledWith("2022-06-03T03:24:55.395Z");

    const value: ValidateShape<
      InferValue<typeof type>,
      string
    > = "2022-06-03T03:24:55.395Z";
    const parsedValue: ValidateShape<
      InferParsedValue<typeof type>,
      Date
    > = type.parse(value);

    expect(parsedValue).toEqual(new Date(value));
  });

  it("mocks a string", () => {
    const value = datetime().mock(faker);

    expect(value).toEqual(expect.any(String));
    expect(new Date(value).toString()).not.toEqual("Invalid Date");
  });

  it("allows defining the mocks", () =>
    expect([
      "2022-06-03T03:24:55.390Z",
      "2022-06-03T03:24:55.399Z",
    ]).toContainEqual(
      datetime({
        mock: (faker) =>
          faker.helpers.arrayElement([
            "2022-06-03T03:24:55.390Z",
            "2022-06-03T03:24:55.399Z",
          ]),
      }).mock(faker)
    ));

  it("mocks the same value with the same path", () => {
    expect(datetime().mock(faker)).toEqual(datetime().mock(faker));
    expect(datetime().mock(faker, ".foo")).toEqual(
      datetime().mock(faker, ".foo")
    );

    expect(datetime().mock(faker, ".foo")).not.toEqual(datetime().mock(faker));
    expect(datetime().mock(faker)).not.toEqual(datetime().mock(faker, ".foo"));
  });

  it("allows defining the zod", () => {
    const type = datetime({
      zod: (zod) => zod.transform((value) => value.length),
    });

    const parsedValue: ValidateShape<
      InferParsedValue<typeof type>,
      number
    > = type.parse("2022-06-03T03:24:55.395Z");

    expect(parsedValue).toEqual(24);
  });

  it("types custom validation", () => {
    const type = datetime({
      validation: (Rule) =>
        Rule.custom((value) => {
          const datetime: ValidateShape<typeof value, string> = value;

          return datetime.length > 50 || "Needs to be 50 characters";
        }),
    });

    const rule = mockRule();

    type.schema().validation(rule);

    expect(rule.custom).toHaveBeenCalledWith(expect.any(Function));
  });
});
