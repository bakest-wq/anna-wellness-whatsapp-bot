function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

export function getSupabaseUrl() {
  return requireEnv("NEXT_PUBLIC_SUPABASE_URL");
}

export function getSupabaseAnonKey() {
  return requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
}

export function getSupabaseServiceRoleKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
}

export function hasSupabaseServiceRoleKey() {
  return Boolean(getSupabaseServiceRoleKey());
}

export function requireSupabaseServiceRoleKey(): string {
  const key = getSupabaseServiceRoleKey();
  if (!key) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is required for admin operations. Add it to .env.local (Supabase → Settings → API → service_role / secret key).",
    );
  }
  return key;
}
