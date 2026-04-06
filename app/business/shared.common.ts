import { z } from "zod";

const PER_PAGE = 10;

const slugSchema = z.object({ slug: z.string().min(1) });

export { PER_PAGE, slugSchema };
