import { createHmac, timingSafeEqual } from "crypto";
import { ADMIN_SESSION_COOKIE } from "@/lib/admin/auth-constants";

export { ADMIN_SESSION_COOKIE, ADMIN_STORAGE_KEY } from "@/lib/admin/auth-constants";

const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export function getAdminPassword(): string | undefined {
  return process.env.ADMIN_PASSWORD?.trim();
}

function signPayload(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("hex");
}

export function createAdminSessionValue(): string | null {
  const secret = getAdminPassword();
  if (!secret) return null;

  const payload = `authenticated:${Date.now()}`;
  const signature = signPayload(payload, secret);
  return `${payload}.${signature}`;
}

export function verifyAdminSessionValue(value: string | undefined): boolean {
  const secret = getAdminPassword();
  if (!secret || !value) return false;

  const [payload, signature] = value.split(".");
  if (!payload?.startsWith("authenticated:") || !signature) return false;

  const expected = signPayload(payload, secret);

  try {
    const a = Buffer.from(signature, "utf8");
    const b = Buffer.from(expected, "utf8");
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function verifyAdminPassword(input: string): boolean {
  const expected = getAdminPassword();
  if (!expected) return false;

  const provided = Buffer.from(input);
  const target = Buffer.from(expected);

  if (provided.length !== target.length) return false;

  try {
    return timingSafeEqual(provided, target);
  } catch {
    return false;
  }
}

export function getAdminSessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: SESSION_MAX_AGE_SECONDS,
    path: "/",
  };
}
