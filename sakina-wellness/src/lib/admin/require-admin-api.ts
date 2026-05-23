import { isAdminAuthenticated } from "@/lib/admin/auth-server";

export async function requireAdminApi(): Promise<Response | null> {
  if (!(await isAdminAuthenticated())) {
    return Response.json({ error: "Требуется авторизация." }, { status: 401 });
  }
  return null;
}
