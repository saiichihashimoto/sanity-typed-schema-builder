import { describe, expect, it } from "@jest/globals";
import { z } from "zod";

import { boolean } from "../boolean";
import { objectNamed } from "../objectNamed";
import { mockRule } from "../test-utils";

import { namedObjectArray } from ".";

import type { ValidateShape } from "../test-utils";
import type {
  InferParsedValue,
  InferResolvedValue,
  InferValue,
} from "../types";
import type { Merge, PartialDeep } from "type-fest";

const dummyObj = objectNamed({
  name: "dummy",
  fields: [
    {
      name: "foo",
      type: boolean(),
    },
  ],
});
type dummyObjType = Merge<InferValue<typeof dummyObj>, { _key: string }>;

const dummyObj2 = objectNamed({
  name: "movie",
  fields: [
    {
      name: "bar",
      type: boolean(),
    },
  ],
});
const dummyObj3 = objectNamed({
  name: "actor",
  fields: [
    {
      name: "baz",
      type: boolean(),
    },
  ],
});

describe("array", () => {
  it("builds a sanity config", () =>
    expect(namedObjectArray({ of: [dummyObj] }).schema()).toEqual({
      type: "array",
      of: [
        {
          type: "object",
          name: "dummy",
          fields: [
            {
              name: "foo",
              type: "boolean",
              validation: expect.any(Function),
            },
          ],
          preview: undefined,
        },
      ],
      validation: expect.any(Function),
    }));

  it("passes through schema values", () =>
    expect(
      namedObjectArray({ of: [dummyObj], hidden: false }).schema()
    ).toHaveProperty("hidden", false));

  it("adds document types", () => {
    const type = namedObjectArray({ of: [dummyObj] });

    const value: ValidateShape<
      InferValue<typeof type>,
      Array<{ _key: string; _type: "dummy"; foo: boolean }>
    > = [
      {
        _type: "dummy",
        _key: "a",
        foo: true,
      },
    ];

    const parsedValue: ValidateShape<
      InferParsedValue<typeof type>,
      Array<{ _key: string; _type: "dummy"; foo: boolean }>
    > = type.parse(value);

    expect(parsedValue).toEqual(value);
  });

  it("creates union with multiple named objects", () => {
    const type = namedObjectArray({
      of: [dummyObj, dummyObj2, dummyObj3],
    });

    const schema = type.schema();

    expect(schema).toHaveProperty("of", [
      {
        type: "object",
        name: "dummy",
        preview: undefined,
        fields: [
          {
            name: "foo",
            type: "boolean",
            validation: expect.any(Function),
          },
        ],
      },
      {
        type: "object",
        name: "movie",
        preview: undefined,
        fields: [
          {
            name: "bar",
            type: "boolean",
            validation: expect.any(Function),
          },
        ],
      },
      {
        type: "object",
        name: "actor",
        preview: undefined,
        fields: [
          {
            name: "baz",
            type: "boolean",
            validation: expect.any(Function),
          },
        ],
      },
    ]);

    const value: ValidateShape<
      InferValue<typeof type>,
      Array<
        | { _key: string; _type: "dummy"; foo: boolean }
        | { _key: string; _type: "movie"; bar: boolean }
        | { _key: string; _type: "actor"; baz: boolean }
      >
    > = [
      { _type: "dummy", _key: "a", foo: true },
      { _type: "movie", _key: "b", bar: true },
      { _type: "actor", _key: "c", baz: true },
    ];
    const parsedValue: ValidateShape<
      InferParsedValue<typeof type>,
      Array<
        | { _key: string; _type: "dummy"; foo: boolean }
        | { _key: string; _type: "movie"; bar: boolean }
        | { _key: string; _type: "actor"; baz: boolean }
      >
    > = type.parse(value);

    expect(parsedValue).toEqual(value);
  });

  it("resolves into an array of objects", () => {
    const type = namedObjectArray({
      of: [
        objectNamed({
          name: "foo" as const,
          fields: [
            {
              name: "foo",
              type: boolean({
                zodResolved: (zod) => zod.transform(() => "foo"),
              }),
            },
          ],
        }),
      ],
    });

    const value: ValidateShape<
      InferValue<typeof type>,
      Array<{ _key: string; _type: "foo"; foo: boolean }>
    > = [
      {
        _type: "foo" as const,
        foo: true,
        _key: "a",
      },
    ];
    const resolvedValue: ValidateShape<
      InferResolvedValue<typeof type>,
      Array<{ _key: string; _type: "foo"; foo: string }>
    > = type.resolve(value);

    expect(resolvedValue).toEqual([{ _type: "foo", foo: "foo", _key: "a" }]);
  });

  it("sets min", () => {
    const type = namedObjectArray({ min: 2, of: [dummyObj] });

    const rule = mockRule();

    type.schema().validation(rule);

    expect(rule.min).toHaveBeenCalledWith(2);

    const value: ValidateShape<
      InferValue<typeof type>,
      [dummyObjType, dummyObjType, ...dummyObjType[]]
    > = [
      { _type: "dummy" as const, foo: true, _key: "a" },
      { _type: "dummy" as const, foo: false, _key: "b" },
    ];
    const parsedValue: ValidateShape<
      InferParsedValue<typeof type>,
      [dummyObjType, dummyObjType, ...dummyObjType[]]
    > = type.parse(value);

    expect(parsedValue).toEqual(value);

    expect(() => {
      type.parse([{ _type: "dummy", foo: true, _key: "a" }]);
    }).toThrow(z.ZodError);
  });

  it("sets max", () => {
    const type = namedObjectArray({ max: 3, of: [dummyObj] });

    const rule = mockRule();

    type.schema().validation(rule);

    expect(rule.max).toHaveBeenCalledWith(3);

    const value: ValidateShape<
      InferValue<typeof type>,
      | []
      | [dummyObjType]
      | [dummyObjType, dummyObjType]
      | [dummyObjType, dummyObjType, dummyObjType]
    > = [
      { _type: "dummy", foo: true, _key: "a" },
      { _type: "dummy", foo: false, _key: "a" },
      { _type: "dummy", foo: true, _key: "a" },
    ];
    const parsedValue: ValidateShape<
      InferParsedValue<typeof type>,
      | []
      | [dummyObjType]
      | [dummyObjType, dummyObjType]
      | [dummyObjType, dummyObjType, dummyObjType]
    > = type.parse(value);

    expect(parsedValue).toEqual(value);

    expect(() => {
      type.parse([
        { _type: "dummy", foo: true, _key: "a" },
        { _type: "dummy", foo: false, _key: "a" },
        { _type: "dummy", foo: true, _key: "a" },
        { _type: "dummy", foo: false, _key: "a" },
      ]);
    }).toThrow(z.ZodError);
  });

  it("sets length", () => {
    const type = namedObjectArray({ length: 2, of: [dummyObj] });

    const rule = mockRule();

    type.schema().validation(rule);

    expect(rule.length).toHaveBeenCalledWith(2);

    const value: ValidateShape<
      InferValue<typeof type>,
      [dummyObjType, dummyObjType]
    > = [
      { _type: "dummy", foo: true, _key: "a" },
      { _type: "dummy", foo: false, _key: "a" },
    ];
    const parsedValue: ValidateShape<
      InferParsedValue<typeof type>,
      [dummyObjType, dummyObjType]
    > = type.parse(value);

    expect(parsedValue).toEqual(value);

    expect(() => {
      type.parse([{ _type: "dummy", foo: true, _key: "a" }]);
    }).toThrow(z.ZodError);

    expect(() => {
      type.parse([
        { _type: "dummy", foo: true, _key: "a" },
        { _type: "dummy", foo: false, _key: "a" },
        { _type: "dummy", foo: true, _key: "a" },
      ]);
    }).toThrow(z.ZodError);
  });

  it("allows defining the zod", () => {
    const type = namedObjectArray({
      of: [
        objectNamed({
          name: "dummy",
          fields: [
            {
              name: "foo",
              type: boolean({
                zod: (zod) => zod.transform((value) => (value ? 1 : 0)),
              }),
            },
          ],
        }),
      ],
      zod: (zod) =>
        zod.transform((values) =>
          values.reduce<number>((sum, val) => sum + val.foo, 0)
        ),
    });

    const parsedValue: ValidateShape<
      InferParsedValue<typeof type>,
      number
    > = type.parse([
      { _type: "dummy", foo: true, _key: "a" },
      { _type: "dummy", foo: false, _key: "a" },
    ]);

    expect(parsedValue).toEqual(1);
  });

  it("types custom validation", () => {
    const type = namedObjectArray({
      of: [dummyObj, dummyObj2],
      validation: (Rule) =>
        Rule.custom((value) => {
          const elements: ValidateShape<
            typeof value,
            PartialDeep<
              Array<
                | { _key: string; _type: "dummy"; foo: boolean }
                | { _key: string; _type: "movie"; bar: boolean }
              >
            >
          > = value;

          return elements.length > 50 || "Needs to be 50 characters";
        }),
    });

    const rule = mockRule();

    type.schema().validation(rule);

    expect(rule.custom).toHaveBeenCalledWith(expect.any(Function));
  });
});
