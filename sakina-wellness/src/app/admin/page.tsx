import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { AdminLogin } from "@/components/admin/admin-login";
import { isAdminAuthenticated } from "@/lib/admin/auth-server";
import { fetchAdminBookings } from "@/lib/admin/queries";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Записи · Sakina Wellness",
  description: "Простая панель записей Sakina Wellness",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const authed = await isAdminAuthenticated();

  if (!authed) {
    return <AdminLogin />;
  }

  const result = await fetchAdminBookings();

  return (
    <AdminDashboard
      bookings={result.bookings}
      analytics={result.analytics}
      clientNotes={result.clientNotes}
      error={result.error}
      hasServiceRoleKey={result.hasServiceRoleKey}
    />
  );
}
