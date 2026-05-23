"use client";

import { AlertCircle, ArrowLeft, Lock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AdminLayoutShell } from "@/components/admin/admin-layout-shell";
import { ADMIN_STORAGE_KEY } from "@/lib/admin/auth-constants";

export function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = sessionStorage.getItem(ADMIN_STORAGE_KEY);
    if (stored === "1") {
      router.refresh();
    }
  }, [router]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const result = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;

      if (!response.ok) {
        throw new Error(result?.error ?? "Не удалось войти.");
      }

      sessionStorage.setItem(ADMIN_STORAGE_KEY, "1");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось войти.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminLayoutShell centered>
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="text-soft mb-6 inline-flex items-center gap-1.5 text-[13px] transition-colors hover:text-[#5F735B]"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
          На сайт
        </Link>

        <div className="admin-panel rounded-[1.75rem] px-6 py-8 sm:px-8 sm:py-10">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#9CAA8F]/15 text-[#5F735B]">
            <Lock className="h-5 w-5" strokeWidth={1.5} />
          </div>

          <p className="text-gold mt-6 text-center text-[11px] font-semibold uppercase tracking-[0.32em]">
            Sakina Wellness
          </p>
          <h1 className="font-display mt-3 text-center text-[1.85rem] font-normal leading-tight text-[#3D3830]">
            Вход в админ-панель
          </h1>
          <p className="text-muted mt-3 text-center text-[15px] font-light leading-relaxed">
            Введите пароль, чтобы открыть записи и аналитику.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <label className="block">
              <span className="text-soft text-[11px] uppercase tracking-[0.2em]">
                Пароль
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                className="booking-input mt-2"
                placeholder="••••••••"
              />
            </label>

            {error && (
              <div
                className="booking-alert flex items-start gap-3"
                role="alert"
              >
                <AlertCircle
                  className="mt-0.5 h-5 w-5 shrink-0 text-[#9A6B4F]"
                  strokeWidth={1.5}
                />
                <p className="text-[14px] leading-relaxed text-[#6B4A38]">
                  {error}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !password}
              className="btn-gold flex min-h-[50px] w-full items-center justify-center rounded-full text-[15px] font-semibold disabled:opacity-60"
            >
              {isLoading ? "Входим…" : "Войти"}
            </button>
          </form>
        </div>
      </div>
    </AdminLayoutShell>
  );
}
