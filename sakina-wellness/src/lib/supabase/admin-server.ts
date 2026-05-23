import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  getSupabaseUrl,
  requireSupabaseServiceRoleKey,
} from "@/lib/supabase/env";

/**
 * PostgREST auth for sb_secret_* keys: send apikey + Authorization Bearer
 * with the same secret value (not a JWT). Never use anon key here.
 */
function createServiceRoleFetch(serviceRoleKey: string): typeof fetch {
  return async (input, init) => {
    const headers = new Headers(init?.headers ?? {});
    headers.set("apikey", serviceRoleKey);

    if (!headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${serviceRoleKey}`);
    }

    return fetch(input, { ...init, headers });
  };
}

let serviceRoleClient: SupabaseClient | null = null;

/**
 * Server-only Supabase client using SUPABASE_SERVICE_ROLE_KEY only.
 * Never import from client components.
 */
export function createServiceRoleSupabaseClient(): SupabaseClient {
  if (!serviceRoleClient) {
    const serviceRoleKey = requireSupabaseServiceRoleKey();

    serviceRoleClient = createClient(getSupabaseUrl(), serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
      global: {
        fetch: createServiceRoleFetch(serviceRoleKey),
      },
    });
  }

  return serviceRoleClient;
}
