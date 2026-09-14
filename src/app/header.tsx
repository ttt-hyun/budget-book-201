import Link from "next/link";
import { CATEGORIES, type Category } from "@/lib/db";
import { logout } from "./login/actions";

type Page = "home" | "settlement";

const PAGES: { key: Page; label: string; path: string }[] = [
  { key: "home", label: "가계부", path: "/" },
  { key: "settlement", label: "인당 정산", path: "/settlement" },
];

/** 공통 헤더: 페이지 탭 + 구분 필터. 탭을 옮겨도 구분 필터는 유지 */
export default function Header({ page, name, cat }: { page: Page; name: string; cat?: Category }) {
  const path = PAGES.find((p) => p.key === page)!.path;
  const withCat = (base: string, c?: Category) => (c ? `${base}?cat=${c}` : base);

  return (
    <>
      <header className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">🍊 제주도 여행 가계부</h1>
        <form action={logout} className="flex items-center gap-2 text-sm">
          <span className="font-medium text-slate-600">{name}님</span>
          <button className="text-slate-400 hover:text-slate-600">로그아웃</button>
        </form>
      </header>

      <nav className="mb-4 grid grid-cols-2 rounded-xl bg-slate-200/70 p-1 text-sm font-semibold">
        {PAGES.map((p) => (
          <Link
            key={p.key}
            href={withCat(p.path, cat)}
            className={`rounded-lg py-2 text-center transition ${
              p.key === page ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {p.label}
          </Link>
        ))}
      </nav>

      <nav className="mb-4 flex gap-2">
        <Chip href={path} active={!cat}>전체</Chip>
        {(Object.keys(CATEGORIES) as Category[]).map((c) => (
          <Chip key={c} href={withCat(path, c)} active={cat === c}>
            {CATEGORIES[c]}
          </Chip>
        ))}
      </nav>
    </>
  );
}

function Chip({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
        active ? "bg-slate-900 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
      }`}
    >
      {children}
    </Link>
  );
}
