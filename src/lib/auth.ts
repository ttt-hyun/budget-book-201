import "server-only";
import { cookies } from "next/headers";
import { SESSION_COOKIE, readSessionToken } from "./session";

export async function getSession() {
  return readSessionToken((await cookies()).get(SESSION_COOKIE)?.value);
}

export async function requireSession() {
  const session = await getSession();
  if (!session) throw new Error("세션이 만료되었어요. 다시 로그인해주세요.");
  return session;
}
