import { z } from "zod";

import type { SanityType } from "../types";
import type { PortableTextBlock } from "@portabletext/types";

interface BlockType
  extends SanityType<
    BlockFieldDef<never, never>,
    z.ZodType<PortableTextBlock>
  > {}

type BlockDef = Omit<BlockFieldDef<never, never>, "description" | "type">;

export const block = (def: BlockDef = {}): BlockType => {
  // TODO Validate PortableTextBlock somehow
  const zod = z.any();

  return {
    zod,
    parse: zod.parse.bind(zod),
    schema: () => ({
      ...def,
      type: "block",
    }),
  };
};
