import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { CATEGORIES, listExpenses } from "@/lib/db";
import { parseCategory, won } from "@/lib/format";
import { calcBalances, calcTransfers } from "@/lib/settlement";
import Header from "../header";

export const dynamic = "force-dynamic";

export default async function SettlementPage({ searchParams }: PageProps<"/settlement">) {
  const session = await getSession();
  if (!session) redirect("/login");

  const cat = parseCategory((await searchParams).cat);
  const expenses = listExpenses(cat);
  const total = expenses.reduce((acc, e) => acc + e.amount, 0);
  const balances = calcBalances(expenses);
  const transfers = calcTransfers(balances);
  const me = session.name;
  const mine = balances.find((b) => b.name === me)!;

  return (
    <main className="mx-auto w-full max-w-2xl px-4 pb-12 pt-6">
      <Header page="settlement" name={me} cat={cat} />

      <section className="rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 p-5 text-white shadow-sm">
        <p className="text-sm opacity-90">{cat ? CATEGORIES[cat] : "전체"} 기준 · 내 정산</p>
        <p className="mt-1 text-3xl font-bold tracking-tight">
          {mine.net > 0 ? `+${won(mine.net)}` : mine.net < 0 ? `-${won(-mine.net)}` : "0원"}
        </p>
        <p className="mt-1 text-sm opacity-90">
          {mine.net > 0 ? "받을 돈이에요" : mine.net < 0 ? "보낼 돈이에요" : "정산할 금액이 없어요"}
        </p>
        <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
          <Stat label="총 지출" value={won(total)} />
          <Stat label="내가 낸 돈" value={won(mine.paid)} />
          <Stat label="내가 쓴 돈" value={won(mine.used)} />
        </div>
      </section>

      <section className="mt-6">
        <div className="mb-2 flex items-baseline justify-between px-1">
          <h2 className="font-semibold text-slate-800">인당 정산</h2>
          <span className="text-xs text-slate-400">부담자·이용자끼리 N등분</span>
        </div>
        <div className="overflow-x-auto rounded-2xl bg-white ring-1 ring-slate-200">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs text-slate-500">
              <tr>
                <th className="px-4 py-2 text-left font-medium">이름</th>
                <th className="px-2 py-2 text-right font-medium">낸 돈</th>
                <th className="px-2 py-2 text-right font-medium">쓴 돈</th>
                <th className="px-4 py-2 text-right font-medium">정산</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {balances.map((b) => (
                <tr key={b.name} className={b.name === me ? "bg-orange-50/60" : undefined}>
                  <td className="whitespace-nowrap px-4 py-2.5 font-medium text-slate-800">{b.name}</td>
                  <td className="whitespace-nowrap px-2 py-2.5 text-right text-slate-600">{won(b.paid)}</td>
                  <td className="whitespace-nowrap px-2 py-2.5 text-right text-slate-600">{won(b.used)}</td>
                  <td
                    className={`whitespace-nowrap px-4 py-2.5 text-right font-semibold ${
                      b.net > 0 ? "text-emerald-600" : b.net < 0 ? "text-red-600" : "text-slate-400"
                    }`}
                  >
                    {b.net > 0 ? `+${won(b.net)}` : b.net < 0 ? `-${won(-b.net)}` : "0원"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-6">
        <h2 className="mb-2 px-1 font-semibold text-slate-800">송금 안내</h2>
        {transfers.length === 0 ? (
          <p className="rounded-2xl bg-white px-4 py-6 text-center text-sm text-slate-400 ring-1 ring-slate-200">
            정산할 금액이 없어요
          </p>
        ) : (
          <ul className="divide-y divide-slate-100 rounded-2xl bg-white ring-1 ring-slate-200">
            {transfers.map((t) => (
              <li
                key={`${t.from}-${t.to}`}
                className={`flex items-center justify-between gap-2 px-4 py-3 text-sm ${
                  t.from === me || t.to === me ? "bg-orange-50/60" : ""
                }`}
              >
                <span className="font-medium text-slate-800">
                  {t.from} <span className="text-slate-400">→</span> {t.to}
                </span>
                <span className="font-semibold text-slate-900">{won(t.amount)}</span>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-2 px-1 text-xs text-slate-400">나눠떨어지지 않는 금액은 1원 단위에서 반올림해요.</p>
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/15 px-3 py-2">
      <p className="text-xs opacity-90">{label}</p>
      <p className="truncate font-semibold">{value}</p>
    </div>
  );
}
