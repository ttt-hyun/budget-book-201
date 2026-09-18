import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import {
  CATEGORIES,
  DAY_GROUPS,
  ETC_DAY,
  LOCAL_DAYS,
  dayLabel,
  listExpenses,
  type Category,
  type Expense,
} from "@/lib/db";
import { parseCategory, won } from "@/lib/format";
import { MEMBERS } from "@/lib/members";
import { currentTripDay } from "@/lib/trip";
import AddExpenseForm from "./add-expense-form";
import DeleteButton from "./delete-button";
import Header from "./header";

export const dynamic = "force-dynamic";

const sum = (list: Expense[]) => list.reduce((acc, e) => acc + e.amount, 0);
const people = (list: string[]) => (list.length === MEMBERS.length ? "전원" : list.join(", "));

/** 구분 필터에 따라 보여줄 일차 그룹: 고정경비 → 기타만, 현지경비 → 1~3일차만 */
const groupsFor = (cat?: Category): number[] =>
  cat === "fixed" ? [ETC_DAY] : cat === "local" ? [...LOCAL_DAYS] : [...DAY_GROUPS];

const GRID_COLS: Record<number, string> = {
  1: "grid-cols-1",
  3: "grid-cols-3",
  4: "grid-cols-2 sm:grid-cols-4",
};

export default async function Home({ searchParams }: PageProps<"/">) {
  const session = await getSession();
  if (!session) redirect("/login");

  const sp = await searchParams;
  const cat = parseCategory(sp.cat);
  const groups = groupsFor(cat);
  const day = typeof sp.day === "string" && sp.day !== "" && groups.includes(Number(sp.day)) ? Number(sp.day) : undefined;

  const expenses = listExpenses(cat);
  const total = sum(expenses);
  const byDay = groups.map((d) => ({ day: d, items: expenses.filter((e) => e.day === d) }));
  const visible = day === undefined ? byDay : byDay.filter((g) => g.day === day);

  const href = (d?: number) => {
    const q = new URLSearchParams();
    if (cat) q.set("cat", cat);
    if (d !== undefined) q.set("day", String(d));
    const s = q.toString();
    return s ? `/?${s}` : "/";
  };

  return (
    <main className="mx-auto w-full max-w-2xl px-4 pb-28 pt-6">
      <Header page="home" name={session.name} cat={cat} />

      <section className="rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 p-5 text-white shadow-sm">
        <p className="text-sm opacity-90">{cat ? CATEGORIES[cat] : "전체"} 총 지출</p>
        <p className="mt-1 text-3xl font-bold tracking-tight">{won(total)}</p>
        <p className="mt-1 text-sm opacity-90">{expenses.length}건</p>
        {!cat && (
          <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
            {(Object.keys(CATEGORIES) as Category[]).map((c) => (
              <div key={c} className="rounded-xl bg-white/15 px-3 py-2">
                <p className="opacity-90">{CATEGORIES[c]}</p>
                <p className="font-semibold">{won(sum(expenses.filter((e) => e.category === c)))}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 일차별 통계 (탭 역할 겸용) */}
      <section className={`mt-4 grid gap-2 ${GRID_COLS[groups.length]}`}>
        {byDay.map((g) => (
          <Link
            key={g.day}
            href={href(day === g.day ? undefined : g.day)}
            className={`rounded-2xl p-3 ring-1 transition ${
              day === g.day ? "bg-orange-50 ring-orange-400" : "bg-white ring-slate-200 hover:ring-slate-300"
            }`}
          >
            <p className="text-xs font-medium text-slate-500">{dayLabel(g.day)}</p>
            <p className="mt-0.5 truncate text-base font-bold text-slate-900">{won(sum(g.items))}</p>
            <p className="text-xs text-slate-400">{g.items.length}건</p>
          </Link>
        ))}
      </section>

      <section className="mt-6 space-y-6">
        {visible.map((g) => (
          <div key={g.day}>
            <div className="mb-2 flex items-baseline justify-between px-1">
              <h2 className="font-semibold text-slate-800">{dayLabel(g.day)}</h2>
              <span className="text-sm text-slate-500">{won(sum(g.items))}</span>
            </div>
            {g.items.length === 0 ? (
              <p className="rounded-2xl bg-white px-4 py-6 text-center text-sm text-slate-400 ring-1 ring-slate-200">
                아직 지출이 없어요
              </p>
            ) : (
              <ul className="divide-y divide-slate-100 overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200">
                {g.items.map((e) => (
                  <li key={e.id} className="flex items-center gap-3 px-4 py-3">
                    <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-slate-100 text-lg">
                      {e.category === "fixed" ? "📌" : "🛍️"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-slate-900">{e.name}</p>
                      <p className="text-xs text-slate-500">
                        <span className="text-slate-400">부담</span> {people(e.payers)}
                        <span className="mx-1 text-slate-300">|</span>
                        <span className="text-slate-400">이용</span> {people(e.users)}
                      </p>
                      <p className="text-xs text-slate-400">
                        <span className={e.category === "fixed" ? "text-sky-600" : "text-emerald-600"}>
                          {CATEGORIES[e.category]}
                        </span>
                        {" · "}
                        {e.author || "알 수 없음"} 작성 · {e.created_at.slice(5, 16)}
                      </p>
                    </div>
                    <p className="shrink-0 font-semibold text-slate-900">{won(e.amount)}</p>
                    <DeleteButton id={e.id} name={e.name} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </section>

      {/* 일차를 고르지 않았으면 오늘 날짜에 해당하는 일차를 기본값으로 */}
      <AddExpenseForm
        key={cat ?? "all"}
        defaultDay={day ?? (cat === "fixed" ? ETC_DAY : currentTripDay())}
        me={session.name}
      />
    </main>
  );
}
