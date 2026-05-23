import { NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  createAdminSessionValue,
  getAdminPassword,
  getAdminSessionCookieOptions,
  verifyAdminPassword,
} from "@/lib/admin/auth";

export async function POST(request: Request) {
  if (!getAdminPassword()) {
    return NextResponse.json(
      { error: "ADMIN_PASSWORD не настроен на сервере." },
      { status: 503 },
    );
  }

  try {
    const body = (await request.json()) as { password?: string };
    const password = typeof body.password === "string" ? body.password : "";

    if (!verifyAdminPassword(password)) {
      return NextResponse.json(
        { error: "Неверный пароль. Попробуйте снова." },
        { status: 401 },
      );
    }

    const sessionValue = createAdminSessionValue();
    if (!sessionValue) {
      return NextResponse.json(
        { error: "Не удалось создать сессию." },
        { status: 500 },
      );
    }

    const response = NextResponse.json({ ok: true });
    response.cookies.set(
      ADMIN_SESSION_COOKIE,
      sessionValue,
      getAdminSessionCookieOptions(),
    );
    return response;
  } catch {
    return NextResponse.json(
      { error: "Некорректный запрос." },
      { status: 400 },
    );
  }
}
