"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { ADMIN_STORAGE_KEY } from "@/lib/admin/auth-constants";

export function AdminLogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    sessionStorage.removeItem(ADMIN_STORAGE_KEY);
    router.refresh();
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="btn-olive-ghost inline-flex min-h-[36px] shrink-0 items-center gap-1 rounded-full px-3 text-[12px]"
    >
      <LogOut className="h-4 w-4" strokeWidth={1.5} />
      Выйти
    </button>
  );
}
