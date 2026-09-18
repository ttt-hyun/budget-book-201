import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { insertExpense } from "@/lib/db";
import { parseExpenseForm } from "@/lib/expense-input";

/**
 * 지출 등록. 서버 액션 대신 주소가 고정된 API 로 받는다.
 * 서버 액션 ID 는 배포할 때마다 바뀌어서, 오래 열어둔 탭에서 저장하면 실패한다.
 */
export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "로그인이 풀렸어요. 다시 로그인해주세요." }, { status: 401 });
  }

  const parsed = parseExpenseForm(await request.formData());
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  insertExpense({ ...parsed.value, author: session.name });
  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true });
}
