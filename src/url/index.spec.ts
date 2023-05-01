import { faker } from "@faker-js/faker";
import { describe, expect, it } from "@jest/globals";
import { z } from "zod";

import { url } from ".";
import { mockRule } from "../test-utils";
import type { ValidateShape } from "../test-utils";
import type {
  InferParsedValue,
  InferResolvedValue,
  InferValue,
} from "../types";

describe("url", () => {
  it("builds a sanity config", () =>
    expect(url().schema()).toStrictEqual({
      type: "url",
    }));

  it("passes through schema values", () =>
    expect(url({ hidden: false }).schema()).toHaveProperty("hidden", false));

  it("parses into a string", () => {
    const type = url();

    const value: ValidateShape<
      InferValue<typeof type>,
      string
    > = "https://example.com/img.jpg";
    const parsedValue: ValidateShape<
      InferParsedValue<typeof type>,
      string
    > = type.parse(value);

    expect(parsedValue).toStrictEqual(value);
  });

  it("resolves into a string", () => {
    const type = url();

    const value: ValidateShape<
      InferValue<typeof type>,
      string
    > = "https://example.com/img.jpg";
    const resolvedValue: ValidateShape<
      InferResolvedValue<typeof type>,
      string
    > = type.resolve(value);

    expect(resolvedValue).toStrictEqual(value);
  });

  it("enforces a url", () => {
    const type = url();

    const value: ValidateShape<InferValue<typeof type>, string> = "not a url";

    expect(() => {
      type.parse(value);
    }).toThrow(z.ZodError);
  });

  it("mocks a url", () =>
    expect(z.string().url().parse(url().mock(faker))).toStrictEqual(
      expect.any(String)
    ));

  it("mocks the same value with the same path", () => {
    expect(url().mock(faker)).toStrictEqual(url().mock(faker));
    expect(url().mock(faker, ".foo")).toStrictEqual(url().mock(faker, ".foo"));

    expect(url().mock(faker, ".foo")).not.toStrictEqual(url().mock(faker));
    expect(url().mock(faker)).not.toStrictEqual(url().mock(faker, ".foo"));
  });

  it("allows defining the mocks", () =>
    expect(["https://google.com", "https://facebook.com"]).toContainEqual(
      url({
        mock: (faker) =>
          faker.helpers.arrayElement([
            "https://google.com",
            "https://facebook.com",
          ]),
      }).mock(faker)
    ));

  it("allows defining the zod", () => {
    const type = url({
      zod: (zod) => zod.transform((value) => value.length),
    });

    const parsedValue: ValidateShape<
      InferParsedValue<typeof type>,
      number
    > = type.parse("https://google.com");

    expect(parsedValue).toBe(18);
  });

  it("types custom validation", () => {
    const type = url({
      validation: (Rule) =>
        Rule.custom((value) => {
          const url: ValidateShape<typeof value, string | undefined> = value;

          return (url?.length ?? 0) > 50 || "Needs to be 50 characters";
        }),
    });

    const rule = mockRule();

    type.schema().validation?.(rule);

    expect(rule.custom).toHaveBeenCalledWith(expect.any(Function));
  });
});
