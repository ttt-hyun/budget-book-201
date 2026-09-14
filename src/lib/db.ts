import "server-only";
import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";
import type { Member } from "./members";

export const CATEGORIES = {
  fixed: "고정경비",
  local: "현지경비",
} as const;
export type Category = keyof typeof CATEGORIES;

/** 현지경비는 1~3일차, 고정경비는 일차 구분 없이 '기타'(0) */
export const ETC_DAY = 0;
export const LOCAL_DAYS = [1, 2, 3] as const;
export const DAY_GROUPS = [...LOCAL_DAYS, ETC_DAY] as const;
export const dayLabel = (day: number) => (day === ETC_DAY ? "기타" : `${day}일차`);

export type Expense = {
  id: number;
  name: string;
  amount: number;
  category: Category;
  day: number;
  payers: Member[];
  users: Member[];
  author: Member;
  created_at: string;
};

type Row = Omit<Expense, "payers" | "users"> & { payers: string; users: string };

const COLUMNS = "id, name, amount, category, day, payers, users, author, created_at";

const schema = (table: string) => `
  CREATE TABLE IF NOT EXISTS ${table} (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT    NOT NULL,
    amount     INTEGER NOT NULL CHECK (amount >= 0),
    category   TEXT    NOT NULL CHECK (category IN ('fixed', 'local')),
    day        INTEGER NOT NULL CHECK (day BETWEEN 0 AND 3),
    payers     TEXT    NOT NULL DEFAULT '[]',
    users      TEXT    NOT NULL DEFAULT '[]',
    author     TEXT    NOT NULL DEFAULT '',
    created_at TEXT    NOT NULL DEFAULT (datetime('now', 'localtime'))
  );
`;

const g = globalThis as unknown as { __db?: DatabaseSync };

function migrate(db: DatabaseSync) {
  // 이전 버전 DB에 새 컬럼 추가
  const cols = new Set(
    (db.prepare("PRAGMA table_info(expenses)").all() as { name: string }[]).map((c) => c.name),
  );
  if (!cols.has("payers")) db.exec("ALTER TABLE expenses ADD COLUMN payers TEXT NOT NULL DEFAULT '[]'");
  if (!cols.has("users")) db.exec("ALTER TABLE expenses ADD COLUMN users TEXT NOT NULL DEFAULT '[]'");
  if (!cols.has("author")) db.exec("ALTER TABLE expenses ADD COLUMN author TEXT NOT NULL DEFAULT ''");

  // day CHECK(1~3) → CHECK(0~3): SQLite는 제약 변경이 안 되므로 테이블 재생성
  const { sql } = db.prepare("SELECT sql FROM sqlite_master WHERE name = 'expenses'").get() as { sql: string };
  if (sql.includes("BETWEEN 1 AND 3")) {
    db.exec(`
      BEGIN;
      ${schema("expenses_new")}
      INSERT INTO expenses_new (${COLUMNS}) SELECT ${COLUMNS} FROM expenses;
      DROP TABLE expenses;
      ALTER TABLE expenses_new RENAME TO expenses;
      COMMIT;
    `);
  }

  db.exec(`UPDATE expenses SET day = ${ETC_DAY} WHERE category = 'fixed' AND day != ${ETC_DAY}`);
}

function open() {
  const dir = path.join(process.cwd(), "data");
  fs.mkdirSync(dir, { recursive: true });
  const db = new DatabaseSync(path.join(dir, "budget.db"));
  db.exec("PRAGMA journal_mode = WAL;");
  db.exec(schema("expenses"));
  migrate(db);
  return db;
}

export function db() {
  return (g.__db ??= open());
}

export function listExpenses(category?: Category): Expense[] {
  const order = `ORDER BY CASE WHEN day = ${ETC_DAY} THEN 99 ELSE day END, id DESC`;
  const sql = category
    ? `SELECT * FROM expenses WHERE category = ? ${order}`
    : `SELECT * FROM expenses ${order}`;
  const stmt = db().prepare(sql);
  const rows = (category ? stmt.all(category) : stmt.all()) as Row[];
  return rows.map((r) => ({ ...r, payers: JSON.parse(r.payers), users: JSON.parse(r.users) }));
}

export function insertExpense(e: Omit<Expense, "id" | "created_at">) {
  db()
    .prepare(
      "INSERT INTO expenses (name, amount, category, day, payers, users, author) VALUES (?, ?, ?, ?, ?, ?, ?)",
    )
    .run(e.name, e.amount, e.category, e.day, JSON.stringify(e.payers), JSON.stringify(e.users), e.author);
}

export function deleteExpense(id: number) {
  db().prepare("DELETE FROM expenses WHERE id = ?").run(id);
}
