import { makeTypedEnv } from "make-typed-env";
import { z } from "zod";

const getEnvironment = makeTypedEnv(
  z.object({
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    DATABASE_URL: z.string().min(1),
  }),
);

const env = () => getEnvironment(process.env);

export { env };
