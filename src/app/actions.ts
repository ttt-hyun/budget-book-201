"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth";
import { CATEGORIES, ETC_DAY, LOCAL_DAYS, deleteExpense, insertExpense, type Category } from "@/lib/db";
import { MEMBERS, isMember } from "@/lib/members";

export type AddState = { error?: string; ok?: boolean };

/** 선택된 이름을 명단 순서대로 중복 없이 정리 */
const pickMembers = (values: FormDataEntryValue[]) => MEMBERS.filter((m) => values.includes(m));

export async function addExpense(_prev: AddState, formData: FormData): Promise<AddState> {
  const session = await requireSession();

  const name = String(formData.get("name") ?? "").trim();
  const amount = Number(String(formData.get("amount") ?? "").replace(/[^\d]/g, ""));
  const category = String(formData.get("category") ?? "") as Category;
  const day = category === "fixed" ? ETC_DAY : Number(formData.get("day"));
  const payers = pickMembers(formData.getAll("payers"));
  const users = pickMembers(formData.getAll("users"));

  if (!name) return { error: "이름을 입력해주세요." };
  if (!Number.isSafeInteger(amount) || amount <= 0) return { error: "가격을 버튼으로 입력해주세요." };
  if (!(category in CATEGORIES)) return { error: "구분을 선택해주세요." };
  if (category === "local" && !(LOCAL_DAYS as readonly number[]).includes(day)) {
    return { error: "일차를 선택해주세요." };
  }
  if (payers.length !== 1) return { error: "부담자를 한 명 선택해주세요." };
  if (users.length === 0) return { error: "이용자를 한 명 이상 선택해주세요." };
  if (!isMember(session.name)) return { error: "작성자 정보가 올바르지 않아요." };

  insertExpense({ name, amount, category, day, payers, users, author: session.name });
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function removeExpense(id: number) {
  await requireSession();
  deleteExpense(id);
  revalidatePath("/", "layout");
}
