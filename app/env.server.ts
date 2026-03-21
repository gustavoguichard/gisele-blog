import { makeTypedEnv } from "make-typed-env";
import { z } from "zod";

const getEnvironment = makeTypedEnv(
  z.object({
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    DATABASE_URL: z.string().min(1),
    SITE_URL: z.string().url().default("https://giseledemenezes.com"),
  }),
);

const env = () => getEnvironment(process.env);

export { env };
