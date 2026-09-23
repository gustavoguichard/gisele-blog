import { z } from "zod";

const SEARCH_MIN_LENGTH = 2;
const SEARCH_MAX_LENGTH = 100;
const SEARCH_LIMIT = 30;
const SEARCH_THRESHOLD = 0.5;

const searchSchema = z.object({
  q: z.string().trim().max(SEARCH_MAX_LENGTH).default(""),
});

export { SEARCH_LIMIT, SEARCH_MAX_LENGTH, SEARCH_MIN_LENGTH, SEARCH_THRESHOLD, searchSchema };
