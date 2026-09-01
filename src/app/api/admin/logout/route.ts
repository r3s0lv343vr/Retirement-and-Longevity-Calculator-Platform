import { createLogoutResponse } from "@/lib/admin/request";

export async function POST() {
  return createLogoutResponse();
}
