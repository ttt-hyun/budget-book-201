"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isMember } from "@/lib/members";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  checkAccessCode,
  createSessionToken,
} from "@/lib/session";

export async function login(
  _prev: { error?: string },
  formData: FormData,
): Promise<{ error?: string }> {
  const name = formData.get("member");
  const code = String(formData.get("code") ?? "");

  if (!isMember(name)) {
    return { error: "본인 이름을 선택해주세요." };
  }
  if (!checkAccessCode(code)) {
    return { error: "코드가 올바르지 않아요." };
  }

  (await cookies()).set(SESSION_COOKIE, createSessionToken(name), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  redirect("/");
}

export async function logout() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/login");
}
