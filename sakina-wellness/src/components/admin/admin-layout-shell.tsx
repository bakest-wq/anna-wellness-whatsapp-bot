import type { ReactNode } from "react";

type AdminLayoutShellProps = {
  children: ReactNode;
  centered?: boolean;
};

export function AdminLayoutShell({
  children,
  centered = false,
}: AdminLayoutShellProps) {
  return (
    <div className="admin-shell min-h-screen">
      <div className="pointer-events-none fixed inset-0 bg-gradient-to-b from-[#FFF9F3] via-[#FAF7F2] to-[#EDE4D4]/30" />
      <div className="grain-overlay pointer-events-none fixed inset-0" />
      <div
        className={
          centered
            ? "relative flex min-h-screen flex-col items-center justify-center px-5 py-12 sm:px-6"
            : "relative"
        }
      >
        {children}
      </div>
    </div>
  );
}
