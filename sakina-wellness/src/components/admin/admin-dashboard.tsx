import { AdminLayoutShell } from "@/components/admin/admin-layout-shell";
import { AdminBookingsWorkspace } from "@/components/admin/admin-bookings-workspace";
import type { AdminBookingsResult } from "@/lib/admin/queries";
import Link from "next/link";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { AdminLogoutButton } from "@/components/admin/admin-logout-button";

type AdminDashboardProps = AdminBookingsResult;

export function AdminDashboard({
  bookings,
  clientNotes,
  error,
  hasServiceRoleKey,
}: AdminDashboardProps) {
  return (
    <AdminLayoutShell>
      <div className="admin-shell-inner mx-auto max-w-[28rem] px-4 pb-[max(2rem,env(safe-area-inset-bottom))] pt-[max(0.75rem,env(safe-area-inset-top))] sm:max-w-xl md:max-w-2xl sm:px-6">
        <header className="admin-header">
          <Link href="/" className="admin-back-link">
            <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
            На сайт
          </Link>

          <div className="mt-5 flex items-start justify-between gap-4">
            <div>
              <p className="text-gold text-[10px] font-semibold uppercase tracking-[0.28em]">
                Sakina Wellness
              </p>
              <h1 className="font-display mt-1.5 text-[1.75rem] font-normal leading-tight text-[#3D3830] sm:text-[2rem]">
                Панель записей
              </h1>
              <p className="text-muted mt-2 text-[14px] font-light leading-relaxed">
                Спокойно и понятно — без лишней сложности.
              </p>
            </div>
            <AdminLogoutButton />
          </div>
        </header>

        {error && (
          <div className="admin-alert mt-5 flex items-start gap-3" role="alert">
            <AlertCircle
              className="mt-0.5 h-5 w-5 shrink-0 text-[#9A6B4F]"
              strokeWidth={1.5}
            />
            <div>
              <p className="text-[14px] leading-relaxed">{error}</p>
              {!hasServiceRoleKey && (
                <p className="text-muted mt-2 text-[13px]">
                  Добавьте ключ Supabase в `.env.local`.
                </p>
              )}
            </div>
          </div>
        )}

        <div className="mt-6">
          <AdminBookingsWorkspace
            initialBookings={bookings}
            initialClientNotes={clientNotes}
          />
        </div>
      </div>
    </AdminLayoutShell>
  );
}
