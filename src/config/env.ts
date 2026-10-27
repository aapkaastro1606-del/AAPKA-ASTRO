import { z } from "zod";

const envSchema = z.object({
  // Node Environment
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(3000),
  APP_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_SITE_URL: z.string().default("https://www.aapkaastro.com"),

  // PostgreSQL Database (Neon Serverless PostgreSQL)
  DATABASE_URL: z
    .string()
    .default("postgresql://postgres:postgres@localhost:5432/aapka_astro?schema=public"),
  DIRECT_URL: z.string().optional(),

  // Redis Cache & Presence
  REDIS_URL: z.string().default("redis://localhost:6379"),

  // Auth & JWT
  JWT_SECRET: z.string().default("aapka-astro-super-secure-jwt-secret-key-change-in-production"),
  JWT_EXPIRES_IN: z.string().default("30d"),

  // Clerk Authentication (Email/Password + Google OAuth)
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z
    .string()
    .default("pk_test_cHJvZm91bmQtY2ljYWRhLTk2OTQuY2xlcmsuYWNjb3VudHMuZGV2JA"),
  CLERK_SECRET_KEY: z.string().optional().default("sk_test_clerk_secret_key_change_in_production"),
  CLERK_WEBHOOK_SECRET: z.string().optional(),
  NEXT_PUBLIC_CLERK_SIGN_IN_URL: z.string().default("/login"),
  NEXT_PUBLIC_CLERK_SIGN_UP_URL: z.string().default("/signup"),
  NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL: z.string().default("/account"),
  NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL: z.string().default("/account"),

  // Configurable Email Signup Policy (Anti-Abuse)
  SIGNUP_EMAIL_POLICY_MODE: z.enum(["blocklist", "allowlist"]).default("blocklist"),
  SIGNUP_EMAIL_ALLOWLIST: z.string().optional(),
  SIGNUP_EMAIL_BLOCKLIST: z.string().optional(),

  // Site Owner Elevation (Designated site owner email)
  OWNER_EMAIL: z.string().optional().default("aapkaastro1606@gmail.com"),
  NEXT_PUBLIC_OWNER_EMAIL: z.string().optional().default("aapkaastro1606@gmail.com"),
  NEXT_PUBLIC_SUPPORT_EMAIL: z.string().optional().default("contact@aapkaastro.com"),

  // Payments (Direct UPI / Mock)
  PAYMENT_PROVIDER: z.enum(["upi", "mock"]).default("upi"),
  NEXT_PUBLIC_UPI_ID: z.string().optional().default("9310709233m@pnb"),
  NEXT_PUBLIC_UPI_NAME: z.string().optional().default("AAPKA ASTRO"),
  NEXT_PUBLIC_WHATSAPP_NUMBER: z.string().optional().default("919311215564"),

  // Swappable Call Provider (Agora / ZegoCloud)
  CALL_PROVIDER: z.enum(["agora", "zegocloud", "mock"]).default("mock"),
  AGORA_APP_ID: z.string().optional().default("agora_mock_app_id"),
  AGORA_APP_CERTIFICATE: z.string().optional().default("agora_mock_certificate"),
  ZEGOCLOUD_APP_ID: z.string().optional(),
  ZEGOCLOUD_SERVER_SECRET: z.string().optional(),

  // Swappable File Storage (Cloudflare R2 / AWS S3 - Private Bucket for internal files)
  STORAGE_PROVIDER: z.enum(["r2", "s3", "mock"]).default("mock"),
  S3_BUCKET: z.string().optional().default("aapka-astro-assets"),
  S3_REGION: z.string().optional().default("auto"),
  S3_ENDPOINT: z.string().optional(),
  S3_ACCESS_KEY_ID: z.string().optional(),
  S3_SECRET_ACCESS_KEY: z.string().optional(),

  // Cloudflare R2 Public Storage (Public bucket for website media images, separate from private bucket)
  R2_PUBLIC_BUCKET: z.string().optional(),
  R2_PUBLIC_DOMAIN: z.string().optional(),

  // Scheduled Automation & Cron Secret
  CRON_SECRET: z.string().optional().default("aapka_astro_cron_secret_token_change_in_production"),

  // Instagram Graph API
  INSTAGRAM_ACCESS_TOKEN: z.string().optional(),

  // Self-hosted Socket.io Server Port
  SOCKET_PORT: z.coerce.number().default(3001),
});

export type EnvConfig = z.infer<typeof envSchema>;

function loadEnv(): EnvConfig {
  const raw = typeof process !== "undefined" && process.env ? process.env : {};
  const cleaned: Record<string, any> = {};
  for (const [key, value] of Object.entries(raw)) {
    cleaned[key] = typeof value === "string" && value.trim() === "" ? undefined : value;
  }

  const result = envSchema.safeParse(cleaned);
  if (!result.success) {
    console.warn("⚠️ Environment configuration validation notice (using safe defaults):", result.error.format());
    const defaults = envSchema.parse({});
    const safeData = { ...defaults };
    for (const [key, val] of Object.entries(cleaned)) {
      if (val !== undefined && key in safeData) {
        const fieldSchema = (envSchema.shape as any)[key];
        if (fieldSchema) {
          const fieldResult = fieldSchema.safeParse(val);
          if (fieldResult.success) {
            (safeData as any)[key] = fieldResult.data;
          }
        }
      }
    }
    return safeData;
  }
  return result.data;
}

export const env = Object.freeze(loadEnv());
