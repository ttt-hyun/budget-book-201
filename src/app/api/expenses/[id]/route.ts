import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { deleteExpense } from "@/lib/db";

export async function DELETE(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "로그인이 풀렸어요. 다시 로그인해주세요." }, { status: 401 });
  }

  const id = Number((await ctx.params).id);
  if (!Number.isSafeInteger(id)) {
    return NextResponse.json({ error: "잘못된 요청이에요." }, { status: 400 });
  }

  deleteExpense(id);
  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true });
}
