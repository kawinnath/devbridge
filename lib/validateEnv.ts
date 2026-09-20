// lib/validateEnv.ts
export function assertEnv(value: string | undefined, name: string): asserts value is string {
  if (!value || value.trim() === "") {
    throw new Error(`❗️ Environment variable ${name} is missing or empty. Please add it to .env.local`);
  }
}
