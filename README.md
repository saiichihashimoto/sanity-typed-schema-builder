# sanity-typed-schema-builder

Build Sanity schemas declaratively and get typescript types of schema values for free!

- Typescript types for Sanity Values!
- Get mock values for tests!
- Get zod schemas for parsing values (most notably, `date` values into javascript `Date`)

## Install

```bash
npm install sanity-typed-schema-builder
```

## Usage

```typescript
import { s } from "sanity-typed-schema-builder";

// Declare types in a familiar way
const fooType = s.document({
  name: "foo",
  fields: [
    {
      name: "foo",
      type: s.string(),
    },
    {
      name: "bar",
      type: s.array({ of: [s.boolean(), s.number({ readOnly: true })] }),
    },
    {
      name: "hello",
      optional: true,
      type: s.object({
        fields: [
          {
            name: "world",
            type: s.number(),
          },
        ],
      }),
    },
  ],
});

// Typescript Types!
type FooType = s.infer<typeof fooType>;

/**
 *  s.infer<typeof fooType> = {
 *    _createdAt: string;
 *    _id: string;
 *    _rev: string;
 *    _type: "foo";
 *    _updatedAt: string;
 *    bar: (boolean | number)[];
 *    foo: string;
 *    hello?: {
 *      world: number;
 *    };
 *  };
 **/

// Use @faker-js/faker to create mocks for tests!
import { faker } from "@faker-js/faker";

const fooMock = fooType.mock(faker);

// Use zod to parse untyped values (and transform values, note _createdAt & _updatedAt specifically)
const parsedFoo: s.output<typeof fooType> = fooType.parse(someInput);

/**
 *  s.output<typeof fooType> = {
 *    _createdAt: Date;
 *    _id: string;
 *    _rev: string;
 *    _type: "foo";
 *    _updatedAt: Date;
 *    bar: (boolean | number)[];
 *    foo: string;
 *    hello?: {
 *      world: number;
 *    };
 *  };
 **/

// Use schemas in Sanity
createSchema({
  name: "default",
  types: [fooType.schema()],
});
```

## Notable Differences:

For all types, the properties provided are the same as the sanity schema types except for these specific differences:

### `type` is removed

`type` is defined via the typed methods, so they aren't required directly

### `name`, `title`, `description`, `fieldset`, & `group` are defined in `fields`

For all types except document and named objects, `type`, `name`, `title`, `description`, `fieldset`, & `group` are not defined in the type but in the `fields`. These aren't relevant specifically to the type, but rather in their relationship to the parent `object` or `document`:

```typescript
s.object({
  fields: [
    {
      // All of these are defined here in the field
      name: "foo",
      title: "Foo",
      description: "This is foo",
      // Not inside of the type itself
      type: s.number({ hidden: true }),
    },
  ],
});
```

### `Rule.required()` replaced with `optional` boolean in `fields`

For types with fields (`document`, `object`, `objectNamed`, `file`, & `image`), the fields can be marked as optional. This will both _not_ set the `validation: (Rule) => Rule.required()` and type the inferred type.

```typescript
s.object({
  fields: [
    {
      name: "foo",
      type: s.number(),
    },
    {
      name: "bar",
      optional: true,
      type: s.number(),
    },
  ],
});

type Value = s.infer<typeof type>;

/**
 * s.infer<typeof type> = {
 *   foo: number;
 *   bar?: number;
 * }
 */

const parsedValue: s.output<typeof type> = type.parse(someInput);

/**
 * s.output<typeof type> = {
 *   foo: number;
 *   bar?: number;
 * }
 */

const schema = type.schema();

/**
 * const schema = {
 *   type: "object",
 *   fields: [
 *     {
 *       name: "foo",
 *       type: "number",
 *       validation: (Rule) => Rule.validation(),
 *     },
 *     {
 *       name: "bar",
 *       type: "number",
 *     },
 *   ],
 * };
 */
```

### `preview` is typed

TODO

### Custom `mock`

Our mocks are using [Faker](https://fakerjs.dev/guide/) under the hood and give default mocks. These mocks are configurable.

```typescript
const type = s.string({
  mock: (faker: Faker, path: string) => faker.name.firstName(),
});

const mock = type.mock(); // "Katelynn"
```

### Custom `zod`

Our parsing is using [Zod](https://zod.dev/) under the hood and has default parsing. These zod schemas are configurable.

```typescript
const type = s.string({
  zod: (zod) => zod.transform((value) => value.length),
});

type Value = s.infer<typeof type>; // This is still a string.

const parsedValue: s.output<typeof type> = type.parse("hello"); // This is a number, specifically `5` in this case
```

## Types

### Array

```typescript
const type = array({
  // Any of the same properties as a normal sanity schema
  // https://www.sanity.io/docs/array-type

  // `of` uses other types directly:
  of: [s.boolean(), s.datetime()],

  // length?: number    sets both zod and validation: (Rule) => Rule.length(length)
  // max?: number       sets both zod and validation: (Rule) => Rule.max(max)
  // min?: number       sets both zod and validation: (Rule) => Rule.min(min)
  // nonempty?: boolean sets both zod and validation: (Rule) => Rule.min(1)
});

type Value = s.infer<typeof type>;

/**
 * s.infer<typeof type> = (boolean | string)[];
 */

const parsedValue: s.output<typeof type> = type.parse(someInput);

/**
 * Notice the recursive transform, particularly with `datetime` becoming a `Date`
 *
 * s.output<typeof type> = (boolean | Date)[];
 */

const schema = type.schema();

/**
 * const schema = {
 *   type: "array",
 *   of: [{ type: "boolean" }, { type: "datetime" }],
 *   ...
 * };
 */
```

### Block

```typescript
const type = block({
  // Any of the same properties as a normal sanity schema
  // https://www.sanity.io/docs/block-type
});

type Value = s.infer<typeof type>;

/**
 * s.infer<typeof type> = PortableTextBlock;
 */

const parsedValue: s.output<typeof type> = type.parse(someInput);

/**
 * s.output<typeof type> = PortableTextBlock;
 */

const schema = type.schema();

/**
 * const schema = {
 *   type: "block",
 *   ...
 * };
 */
```

### Boolean

```typescript
const type = boolean({
  // Any of the same properties as a normal sanity schema
  // https://www.sanity.io/docs/boolean-type
});

type Value = s.infer<typeof type>;

/**
 * s.infer<typeof type> = boolean;
 */

const parsedValue: s.output<typeof type> = type.parse(someInput);

/**
 * s.output<typeof type> = boolean;
 */

const schema = type.schema();

/**
 * const schema = {
 *   type: "boolean",
 *   ...
 * };
 */
```

### Date

```typescript
const type = date({
  // Any of the same properties as a normal sanity schema
  // https://www.sanity.io/docs/date-type
});

type Value = s.infer<typeof type>;

/**
 * s.infer<typeof type> = string;
 */

const parsedValue: s.output<typeof type> = type.parse(someInput);

/**
 * s.output<typeof type> = string;
 */

const schema = type.schema();

/**
 * const schema = {
 *   type: "date",
 *   ...
 * };
 */
```

### Datetime

```typescript
const type = datetime({
  // Any of the same properties as a normal sanity schema
  // https://www.sanity.io/docs/datetime-type
  // max?: string sets both zod and validation: (Rule) => Rule.max(max)
  // min?: string sets both zod and validation: (Rule) => Rule.min(min)
});

type Value = s.infer<typeof type>;

/**
 * s.infer<typeof type> = string;
 */

const parsedValue: s.output<typeof type> = type.parse(someInput);

/**
 * s.output<typeof type> = Date;
 */

const schema = type.schema();

/**
 * const schema = {
 *   type: "datetime",
 *   ...
 * };
 */
```

### Document

```typescript
const type = document({
  // Any of the same properties as a normal sanity schema
  // https://www.sanity.io/docs/document-type
  name: "foo",
  fields: [
    {
      name: "foo",
      type: s.number(),
    },
    {
      name: "bar",
      optional: true,
      type: s.number(),
    },
  ],
});

type Value = s.infer<typeof type>;

/**
 * s.infer<typeof type> = {
 *   _createdAt: string;
 *   _id: string;
 *   _rev: string;
 *   _type: "foo";
 *   _updatedAt: string;
 *   foo: number;
 *   bar?: number;
 * };
 */

const parsedValue: s.output<typeof type> = type.parse(someInput);

/**
 * s.output<typeof type> = {
 *   _createdAt: Date;
 *   _id: string;
 *   _rev: string;
 *   _type: "foo";
 *   _updatedAt: Date;
 *   foo: number;
 *   bar?: number;
 * };
 */

const schema = type.schema();

/**
 * const schema = {
 *   name: "foo",
 *   type: "document",
 *   fields: [...],
 *   ...
 * };
 */
```

### File

```typescript
const type = file({
  // Any of the same properties as a normal sanity schema
  // https://www.sanity.io/docs/file-type
  fields: [
    {
      name: "foo",
      type: s.number(),
    },
    {
      name: "bar",
      optional: true,
      type: s.number(),
    },
  ],
});

type Value = s.infer<typeof type>;

/**
 * s.infer<typeof type> = {
 *   _type: "file";
 *   asset: {
 *     _type: "reference";
 *     _ref: string;
 *   };
 *   foo: number;
 *   bar?: number;
 * };
 */

const parsedValue: s.output<typeof type> = type.parse(someInput);

/**
 * s.output<typeof type> = {
 *   _type: "file";
 *   asset: {
 *     _type: "reference";
 *     _ref: string;
 *   };
 *   foo: number;
 *   bar?: number;
 * };
 */

const schema = type.schema();

/**
 * const schema = {
 *   name: "foo",
 *   type: "file",
 *   fields: [...],
 *   ...
 * };
 */
```

### Geopoint

```typescript
const type = geopoint({
  // Any of the same properties as a normal sanity schema
  // https://www.sanity.io/docs/geopoint-type
});

type Value = s.infer<typeof type>;

/**
 * s.infer<typeof type> = {
 *   _type: "geopoint";
 *   alt: number;
 *   lat: number;
 *   lng: number;
 * };
 */

const parsedValue: s.output<typeof type> = type.parse(someInput);

/**
 * s.output<typeof type> = {
 *   _type: "geopoint";
 *   alt: number;
 *   lat: number;
 *   lng: number;
 * };
 */

const schema = type.schema();

/**
 * const schema = {
 *   type: "geopoint",
 *   ...
 * };
 */
```

### Image

```typescript
const type = image({
  // Any of the same properties as a normal sanity schema
  // https://www.sanity.io/docs/image-type
  // hotspot?: true adds the `crop` & `hotspot` to the value types, mocks, and parsing
  fields: [
    {
      name: "foo",
      type: s.number(),
    },
    {
      name: "bar",
      optional: true,
      type: s.number(),
    },
  ],
});

type Value = s.infer<typeof type>;

/**
 * s.infer<typeof type> = {
 *   _type: "image";
 *   asset: {
 *     _type: "reference";
 *     _ref: string;
 *   };
 *   foo: number;
 *   bar?: number;
 * };
 */

const parsedValue: s.output<typeof type> = type.parse(someInput);

/**
 * s.output<typeof type> = {
 *   _type: "image";
 *   asset: {
 *     _type: "reference";
 *     _ref: string;
 *   };
 *   foo: number;
 *   bar?: number;
 * };
 */

const schema = type.schema();

/**
 * const schema = {
 *   name: "foo",
 *   type: "image",
 *   fields: [...],
 *   ...
 * };
 */
```

### Number

```typescript
const type = number({
  // Any of the same properties as a normal sanity schema
  // https://www.sanity.io/docs/number-type
  // greaterThan?: number sets both zod and validation: (Rule) => Rule.greaterThan(greaterThan)
  // integer?: boolean    sets both zod and validation: (Rule) => Rule.integer()
  // lessThan?: number    sets both zod and validation: (Rule) => Rule.lessThan(lessThan)
  // max?: number         sets both zod and validation: (Rule) => Rule.max(max)
  // min?: number         sets both zod and validation: (Rule) => Rule.min(min)
  // negative?: boolean   sets both zod and validation: (Rule) => Rule.negative()
  // positive?: boolean   sets both zod and validation: (Rule) => Rule.positive()
  // precision?: number   sets both zod and validation: (Rule) => Rule.precision(precision)
});

type Value = s.infer<typeof type>;

/**
 * s.infer<typeof type> = number;
 */

const parsedValue: s.output<typeof type> = type.parse(someInput);

/**
 * s.output<typeof type> = number;
 */

const schema = type.schema();

/**
 * const schema = {
 *   type: "number",
 *   ...
 * };
 */
```

### Object

```typescript
const type = object({
  // Any of the same properties as a normal sanity schema
  // https://www.sanity.io/docs/object-type
  fields: [
    {
      name: "foo",
      type: s.number(),
    },
    {
      name: "bar",
      optional: true,
      type: s.number(),
    },
  ],
});

type Value = s.infer<typeof type>;

/**
 * s.infer<typeof type> = {
 *   foo: number;
 *   bar?: number;
 * };
 */

const parsedValue: s.output<typeof type> = type.parse(someInput);

/**
 * s.output<typeof type> = {
 *   foo: number;
 *   bar?: number;
 * };
 */

const schema = type.schema();

/**
 * const schema = {
 *   name: "foo",
 *   type: "object",
 *   fields: [...],
 *   ...
 * };
 */
```

### Object (Named)

This is separate from `object` because, when objects are named in sanity, there are significant differences:

- The value has a `_type` field equal to the object's name.
- They can be used directly in schemas (like any other schema).
- They can also be registered as a top level object and simply referenced by type within another schema.

```typescript
const type = objectNamed({
  // Any of the same properties as a normal sanity schema
  // https://www.sanity.io/docs/object-type
  name: "aNamedObject",
  fields: [
    {
      name: "foo",
      type: s.number(),
    },
    {
      name: "bar",
      optional: true,
      type: s.number(),
    },
  ],
});

type Value = s.infer<typeof type>;

/**
 * s.infer<typeof type> = {
 *   _type: "aNamedObject";
 *   foo: number;
 *   bar?: number;
 * };
 */

const parsedValue: s.output<typeof type> = type.parse(someInput);

/**
 * s.output<typeof type> = {
 *   _type: "aNamedObject";
 *   foo: number;
 *   bar?: number;
 * };
 */

const schema = type.schema();

/**
 * const schema = {
 *   name: "foo",
 *   type: "object",
 *   fields: [...],
 *   ...
 * };
 */
```

```typescript
// Use `.ref()` to reference it in another schema.
const someOtherType = array({ of: [type.ref()] });

// The reference value is used directly.
type SomeOtherValue = s.infer<typeof someOtherType>;

/**
 * type SomeOtherValue = [{
 *   _type: "aNamedObject";
 *   foo: number;
 *   bar?: number;
 * }];
 */

// The schema is made within the referencing schema
const someOtherTypeSchema = someOtherType.schema();

/**
 * const someOtherTypeSchema = {
 *   type: "array",
 *   of: [{ type: "" }],
 *   ...
 * };
 */

createSchema({
  name: "default",
  types: [type.schema(), someOtherType.schema()],
});
```

### Reference

```typescript
const type = reference({
  // Any of the same properties as a normal sanity schema
  // https://www.sanity.io/docs/reference-type
  to: [someDocumentType, someOtherDocumentType],
});

type Value = s.infer<typeof type>;

/**
 * s.infer<typeof type> = {
 *   _ref: string;
 *   _type: "reference";
 *   _weak?: boolean;
 * };
 */

const parsedValue: s.output<typeof type> = type.parse(someInput);

/**
 * s.output<typeof type> = {
 *   _ref: string;
 *   _type: "reference";
 *   _weak?: boolean;
 * };
 */

const schema = type.schema();

/**
 * const schema = {
 *   type: "reference",
 *   to: [...],
 *   ...
 * };
 */
```

### Slug

```typescript
const type = slug({
  // Any of the same properties as a normal sanity schema
  // https://www.sanity.io/docs/slug-type
});

type Value = s.infer<typeof type>;

/**
 * s.infer<typeof type> = {
 *   _type: "slug";
 *   current: string;
 * };
 */

const parsedValue: s.output<typeof type> = type.parse(someInput);

/**
 * s.output<typeof type> = string;
 */

const schema = type.schema();

/**
 * const schema = {
 *   type: "slug",
 *   ...
 * };
 */
```

### String

```typescript
const type = string({
  // Any of the same properties as a normal sanity schema
  // https://www.sanity.io/docs/string-type
  // length?: number sets both zod and validation: (Rule) => Rule.length(length)
  // max?: number    sets both zod and validation: (Rule) => Rule.max(max)
  // min?: number    sets both zod and validation: (Rule) => Rule.min(min)
  // regex?: Regex   sets both zod and validation: (Rule) => Rule.regex(regex)
});

type Value = s.infer<typeof type>;

/**
 * s.infer<typeof type> = string;
 */

const parsedValue: s.output<typeof type> = type.parse(someInput);

/**
 * s.output<typeof type> = string;
 */

const schema = type.schema();

/**
 * const schema = {
 *   type: "string",
 *   ...
 * };
 */
```

### Text

```typescript
const type = text({
  // Any of the same properties as a normal sanity schema
  // https://www.sanity.io/docs/text-type
  // length?: number sets both zod and validation: (Rule) => Rule.length(length)
  // max?: number    sets both zod and validation: (Rule) => Rule.max(max)
  // min?: number    sets both zod and validation: (Rule) => Rule.min(min)
  // regex?: Regex   sets both zod and validation: (Rule) => Rule.regex(regex)
});

type Value = s.infer<typeof type>;

/**
 * s.infer<typeof type> = string;
 */

const parsedValue: s.output<typeof type> = type.parse(someInput);

/**
 * s.output<typeof type> = string;
 */

const schema = type.schema();

/**
 * const schema = {
 *   type: "text",
 *   ...
 * };
 */
```

### URL

```typescript
const type = url({
  // Any of the same properties as a normal sanity schema
  // https://www.sanity.io/docs/url-type
});

type Value = s.infer<typeof type>;

/**
 * s.infer<typeof type> = string;
 */

const parsedValue: s.output<typeof type> = type.parse(someInput);

/**
 * s.output<typeof type> = string;
 */

const schema = type.schema();

/**
 * const schema = {
 *   type: "url",
 *   ...
 * };
 */
```
