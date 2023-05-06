import { faker } from "@faker-js/faker";
import { describe, expect, it } from "@jest/globals";
import { s } from "@sanity-typed/schema-builder";
import { z } from "zod";

import { mockRule } from "../test-utils";
import type { Equal, Expect } from "../test-utils";

describe("text", () => {
  it("builds a sanity config", () =>
    expect(s.text().schema()).toStrictEqual({
      type: "text",
      validation: expect.any(Function),
    }));

  it("passes through schema values", () =>
    expect(s.text({ hidden: false }).schema()).toHaveProperty("hidden", false));

  it("parses into a string", () => {
    const type = s.text();

    const value = "foo";
    const parsedValue = type.parse(value);

    type Assertions = [Expect<Equal<typeof parsedValue, string>>];

    expect(parsedValue).toStrictEqual(value);
  });

  it("resolves into a string", () => {
    const type = s.text();

    const value = "foo";
    const resolvedValue = type.parse(value);

    type Assertions = [Expect<Equal<typeof resolvedValue, string>>];

    expect(resolvedValue).toStrictEqual(value);
  });

  it("sets min", () => {
    const type = s.text({ min: 3 });

    const rule = mockRule();

    type.schema().validation(rule);

    expect(rule.min).toHaveBeenCalledWith(3);

    const value = "foo";
    const parsedValue = type.parse(value);

    expect(parsedValue).toStrictEqual(value);

    expect(() => {
      type.parse("fo");
    }).toThrow(z.ZodError);
  });

  it("sets max", () => {
    const type = s.text({ max: 4 });

    const rule = mockRule();

    type.schema().validation(rule);

    expect(rule.max).toHaveBeenCalledWith(4);

    const value = "foo";
    const parsedValue = type.parse(value);

    expect(parsedValue).toStrictEqual(value);

    expect(() => {
      type.parse("foobar");
    }).toThrow(z.ZodError);
  });

  it("sets length", () => {
    const type = s.text({ length: 3 });

    const rule = mockRule();

    type.schema().validation(rule);

    expect(rule.length).toHaveBeenCalledWith(3);

    const value = "foo";
    const parsedValue = type.parse(value);

    expect(parsedValue).toStrictEqual(value);

    expect(() => {
      type.parse("fooo");
    }).toThrow(z.ZodError);
  });

  it("sets regex", () => {
    const type = s.text({ regex: /^foo$/ });

    const rule = mockRule();

    type.schema().validation(rule);

    expect(rule.regex).toHaveBeenCalledWith(/^foo$/);

    const value = "foo";
    const parsedValue = type.parse(value);

    expect(parsedValue).toStrictEqual(value);

    expect(() => {
      type.parse("bar");
    }).toThrow(z.ZodError);
  });

  it("mocks some paragraphs", () =>
    expect(s.text().mock(faker)).toStrictEqual(expect.any(String)));

  it("mocks the same value with the same path", () => {
    expect(s.text().mock(faker)).toStrictEqual(s.text().mock(faker));
    expect(s.text().mock(faker, ".foo")).toStrictEqual(
      s.text().mock(faker, ".foo")
    );

    expect(s.text().mock(faker, ".foo")).not.toStrictEqual(
      s.text().mock(faker)
    );
    expect(s.text().mock(faker)).not.toStrictEqual(
      s.text().mock(faker, ".foo")
    );
  });

  it("allows defining the mocks", () =>
    expect(["Option 1", "Option 2"]).toContainEqual(
      s
        .text({
          mock: (faker) => faker.helpers.arrayElement(["Option 1", "Option 2"]),
        })
        .mock(faker)
    ));

  it("allows defining the zod", () => {
    const type = s.text({
      zod: (zod) => zod.transform((value) => value.length),
    });

    const value = "Test String";
    const parsedValue = type.parse(value);

    type Assertions = [Expect<Equal<typeof parsedValue, number>>];

    expect(parsedValue).toBe(11);
  });

  it("types custom validation", () => {
    const type = s.text({
      validation: (Rule) =>
        Rule.custom((value) => {
          type Assertions = [Expect<Equal<typeof value, string | undefined>>];

          return (value?.length ?? 0) > 50 || "Needs to be 50 characters";
        }),
    });

    const rule = mockRule();

    type.schema().validation(rule);

    expect(rule.custom).toHaveBeenCalledWith(expect.any(Function));
  });
});
