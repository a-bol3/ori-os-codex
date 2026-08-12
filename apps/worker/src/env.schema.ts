import { z } from "zod";

const baseEnvSchema = z.object({
  REDIS_HOST: z.string().default("localhost"),
  REDIS_PORT: z.string().regex(/^\d+$/).default("6379"),
  RESEND_API_KEY: z.string().optional(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  SMTP_SECURE: z.string().optional(),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  ENABLE_EMAIL_FIXTURES: z.enum(["true", "false"]).default("false"),
});

export const envSchema = baseEnvSchema.superRefine((data, ctx) => {
  const hasResend = Boolean(data.RESEND_API_KEY);
  const hasSmtp =
    Boolean(data.SMTP_HOST) &&
    Boolean(data.SMTP_USER) &&
    Boolean(data.SMTP_PASSWORD);

  if (data.NODE_ENV === "production" && !hasResend && !hasSmtp) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message:
        "Production worker requires either RESEND_API_KEY or SMTP_HOST/SMTP_USER/SMTP_PASSWORD",
      path: ["RESEND_API_KEY"],
    });
  }

  if (data.NODE_ENV === "production" && data.ENABLE_EMAIL_FIXTURES === "true") {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "ENABLE_EMAIL_FIXTURES must be false in production",
      path: ["ENABLE_EMAIL_FIXTURES"],
    });
  }
});

export type WorkerEnv = z.infer<typeof envSchema>;

export function validateWorkerEnv(
  env: NodeJS.ProcessEnv = process.env,
): WorkerEnv {
  const result = envSchema.safeParse(env);

  if (!result.success) {
    console.error(
      "Invalid worker environment variables:",
      result.error.format(),
    );
    throw new Error("Invalid worker environment variables");
  }

  return result.data;
}
