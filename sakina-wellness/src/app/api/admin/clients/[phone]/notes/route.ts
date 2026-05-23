import { NextResponse } from "next/server";
import { isValidClientPhoneKey } from "@/lib/admin/phone";
import { requireAdminApi } from "@/lib/admin/require-admin-api";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/admin-server";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ phone: string }> },
) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  const { phone: phoneParam } = await context.params;
  const phoneKey = decodeURIComponent(phoneParam ?? "").trim();

  if (!isValidClientPhoneKey(phoneKey)) {
    return NextResponse.json(
      { error: "Некорректный номер клиента." },
      { status: 400 },
    );
  }

  try {
    const body = (await request.json()) as { notes?: unknown };
    const notes = typeof body.notes === "string" ? body.notes : "";

    if (notes.length > 8000) {
      return NextResponse.json(
        { error: "Заметка слишком длинная (макс. 8000 символов)." },
        { status: 400 },
      );
    }

    const supabase = createServiceRoleSupabaseClient();

    const { data, error } = await supabase
      .from("client_profiles")
      .upsert(
        {
          phone_normalized: phoneKey,
          notes,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "phone_normalized" },
      )
      .select("phone_normalized, notes, updated_at")
      .single();

    if (error) {
      console.error("[admin] client notes save failed:", error.message, error.code);
      return NextResponse.json(
        {
          error:
            "Не удалось сохранить заметку. Убедитесь, что таблица client_profiles создана в Supabase.",
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      phoneKey: data.phone_normalized,
      notes: data.notes,
      updatedAt: data.updated_at,
    });
  } catch {
    return NextResponse.json(
      { error: "Некорректный запрос." },
      { status: 400 },
    );
  }
}
