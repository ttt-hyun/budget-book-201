import "server-only";
import { cookies } from "next/headers";
import { SESSION_COOKIE, readSessionToken } from "./session";

export async function getSession() {
  return readSessionToken((await cookies()).get(SESSION_COOKIE)?.value);
}
