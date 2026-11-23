import 'dotenv/config';
import { z } from 'zod';
declare const schema: z.ZodObject<{
    NODE_ENV: z.ZodDefault<z.ZodEnum<{
        development: "development";
        production: "production";
        test: "test";
    }>>;
    PORT: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    TRUST_PROXY: z.ZodPipe<z.ZodDefault<z.ZodString>, z.ZodTransform<number | boolean, string>>;
    CORS_ORIGIN: z.ZodPipe<z.ZodDefault<z.ZodString>, z.ZodTransform<string[], string>>;
    ENABLE_SWAGGER: z.ZodDefault<z.ZodPipe<z.ZodEnum<{
        false: "false";
        true: "true";
    }>, z.ZodTransform<boolean, "false" | "true">>>;
    DB_SERVER: z.ZodString;
    DB_PORT: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    DB_NAME: z.ZodString;
    DB_USER: z.ZodString;
    DB_PASSWORD: z.ZodString;
    DB_ENCRYPT: z.ZodDefault<z.ZodPipe<z.ZodEnum<{
        false: "false";
        true: "true";
    }>, z.ZodTransform<boolean, "false" | "true">>>;
    DB_TRUST_SERVER_CERT: z.ZodDefault<z.ZodPipe<z.ZodEnum<{
        false: "false";
        true: "true";
    }>, z.ZodTransform<boolean, "false" | "true">>>;
    JWT_SECRET: z.ZodString;
    JWT_EXPIRES_IN_SECONDS: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    BCRYPT_COST: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
}, z.core.$strip>;
export type Env = z.infer<typeof schema>;
export declare const env: Env;
export {};
//# sourceMappingURL=env.d.ts.map