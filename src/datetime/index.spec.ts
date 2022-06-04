import { describe, expect, it } from "@jest/globals";

import { mockRule } from "../test-utils";

import { datetime } from ".";

import type { ValidateShape } from "../test-utils";
import type { InferInput, InferOutput } from "../types";

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
      InferInput<typeof type>,
      string
    > = "2022-06-03T03:24:55.395Z";
    const parsedValue: ValidateShape<
      InferOutput<typeof type>,
      Date
    > = type.parse(value);

    expect(parsedValue).toEqual(new Date(value));
  });

  it("enforces a valid Date", () => {
    const type = datetime();

    const value: ValidateShape<InferInput<typeof type>, string> = "not a date";

    expect(() => {
      type.parse(value);
    }).toThrow("Invalid Date");
  });

  it("sets min", () => {
    const type = datetime({ min: "2022-06-03T03:24:55.394Z" });

    const min = mockRule();

    const rule = {
      ...mockRule(),
      min: () => min,
    };

    expect(type.schema().validation?.(rule)).toEqual(min);

    const value: ValidateShape<
      InferInput<typeof type>,
      string
    > = "2022-06-03T03:24:55.395Z";
    const parsedValue: ValidateShape<
      InferOutput<typeof type>,
      Date
    > = type.parse(value);

    expect(parsedValue).toEqual(new Date(value));

    expect(() => {
      type.parse("2022-06-03T03:24:55.390Z");
    }).toThrow("Greater than 2022-06-03T03:24:55.394Z");
  });

  it("sets max", () => {
    const type = datetime({ max: "2022-06-03T03:24:55.396Z" });

    const max = mockRule();

    const rule = {
      ...mockRule(),
      max: () => max,
    };

    expect(type.schema().validation?.(rule)).toEqual(max);

    const value: ValidateShape<
      InferInput<typeof type>,
      string
    > = "2022-06-03T03:24:55.395Z";
    const parsedValue: ValidateShape<
      InferOutput<typeof type>,
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

    const min = mockRule();

    const rule = {
      ...mockRule(),
      min: () => min,
    };

    expect(type.schema().validation?.(rule)).toEqual(min);

    const value: ValidateShape<
      InferInput<typeof type>,
      string
    > = "2022-06-03T03:24:55.395Z";
    const parsedValue: ValidateShape<
      InferOutput<typeof type>,
      Date
    > = type.parse(value);

    expect(parsedValue).toEqual(new Date(value));
  });

  it("mocks a string", () => {
    const value = datetime().mock();

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
      }).mock()
    ));
});
