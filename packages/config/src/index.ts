import { z } from 'zod';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Search upward from CWD to find the monorepo root .env
function findEnvFile(startDir: string): string | undefined {
  let dir = startDir;
  for (let i = 0; i < 5; i++) {
    const candidate = path.join(dir, '.env');
    if (fs.existsSync(candidate)) return candidate;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return undefined;
}

const envPath = findEnvFile(process.cwd());
dotenv.config({ path: envPath });

export const EnvConfigSchema = z.object({
  // Node Environment
  NODE_ENV: z.enum(['development', 'test', 'staging', 'production']).default('development'),
  PORT: z.coerce.number().default(4000),
  WEB_PORT: z.coerce.number().default(3000),

  // URLs & CORS
  SANCHAY_WEB_URL: z.string().url().default('http://localhost:3000'),
  SANCHAY_API_URL: z.string().url().default('http://localhost:4000/api/v1'),
  CORS_ALLOWED_ORIGINS: z.string().default('http://localhost:3000'),

  // Database
  DATABASE_URL: z.string().min(1).default('postgresql://sanchay_user:sanchay_password@localhost:5432/sanchay_db?schema=public'),

  // Redis
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().default(6379),
  REDIS_PASSWORD: z.string().optional().default(''),

  // Security & Auth
  JWT_SECRET: z.string().min(16).default('development_jwt_secret_must_be_overridden_in_production'),
  SESSION_SECRET: z.string().min(16).default('development_session_secret_must_be_overridden_in_production'),

  // Storage
  OBJECT_STORAGE_ENDPOINT: z.string().default('http://localhost:9000'),
  OBJECT_STORAGE_BUCKET: z.string().default('sanchay-documents'),
  OBJECT_STORAGE_ACCESS_KEY: z.string().default('minioadmin'),
  OBJECT_STORAGE_SECRET_KEY: z.string().default('minioadmin'),
  OBJECT_STORAGE_USE_SSL: z.coerce.boolean().default(false),

  // AI & Embeddings
  AI_PROVIDER: z.enum(['mock', 'openrouter', 'together', 'gemini', 'openai', 'custom']).default('mock'),
  AI_API_KEY: z.string().optional().default(''),
  AI_BASE_URL: z.string().optional().default(''),
  AI_MODEL: z.string().optional().default(''),

  EMBEDDING_PROVIDER: z.enum(['mock', 'gemini', 'openai', 'custom']).default('mock'),
  EMBEDDING_API_KEY: z.string().optional().default(''),
  EMBEDDING_MODEL_NAME: z.string().default('text-embedding-3-small'),

  // Observability
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  OTEL_EXPORTER_OTLP_ENDPOINT: z.string().optional().default(''),
});

export type EnvConfig = z.infer<typeof EnvConfigSchema>;

export function loadConfig(env: Record<string, unknown> = process.env): EnvConfig {
  const result = EnvConfigSchema.safeParse(env);
  if (!result.success) {
    const formattedErrors = result.error.format();
    throw new Error(`[SANCHAY CONFIG ERROR] Invalid environment configuration: ${JSON.stringify(formattedErrors, null, 2)}`);
  }
  return result.data;
}

export const appConfig = loadConfig();
