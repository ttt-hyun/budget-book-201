import { CATEGORIES, ETC_DAY, LOCAL_DAYS, type Category } from "./db";
import { MEMBERS, type Member } from "./members";

export type ExpenseInput = {
  name: string;
  amount: number;
  category: Category;
  day: number;
  payers: Member[];
  users: Member[];
};

/** 선택된 이름을 명단 순서대로 중복 없이 정리 */
const pickMembers = (values: FormDataEntryValue[]) => MEMBERS.filter((m) => values.includes(m));

/** 입력값 검증. 오류는 예외 대신 메시지로 돌려준다 */
export function parseExpenseForm(formData: FormData): { error: string } | { value: ExpenseInput } {
  const name = String(formData.get("name") ?? "").trim();
  const amount = Number(String(formData.get("amount") ?? "").replace(/[^\d]/g, ""));
  const category = String(formData.get("category") ?? "") as Category;
  const day = category === "fixed" ? ETC_DAY : Number(formData.get("day"));
  const payers = pickMembers(formData.getAll("payers"));
  const users = pickMembers(formData.getAll("users"));

  if (!name) return { error: "이름을 입력해주세요." };
  if (!Number.isSafeInteger(amount) || amount <= 0) return { error: "가격을 입력해주세요." };
  if (!(category in CATEGORIES)) return { error: "구분을 선택해주세요." };
  if (category === "local" && !(LOCAL_DAYS as readonly number[]).includes(day)) {
    return { error: "일차를 선택해주세요." };
  }
  if (payers.length !== 1) return { error: "부담자를 한 명 선택해주세요." };
  if (users.length === 0) return { error: "이용자를 한 명 이상 선택해주세요." };

  return { value: { name, amount, category, day, payers, users } };
}
