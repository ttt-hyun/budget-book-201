"use client";

import { useActionState, useState } from "react";
import { DEFAULT_PAYER, MEMBERS, type Member } from "@/lib/members";
import { addExpense, type AddState } from "./actions";

export default function AddExpenseForm({ defaultDay, me }: { defaultDay?: number; me: Member }) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<"fixed" | "local">(defaultDay === 0 ? "fixed" : "local");
  const [amount, setAmount] = useState(0);
  const [payer, setPayer] = useState<Member>(DEFAULT_PAYER);
  const [users, setUsers] = useState<Member[]>([...MEMBERS]);

  const [state, action, pending] = useActionState(async (prev: AddState, formData: FormData) => {
    const result = await addExpense(prev, formData);
    if (result.ok) {
      setAmount(0);
      setPayer(DEFAULT_PAYER);
      setUsers([...MEMBERS]);
      setOpen(false);
    }
    return result;
  }, {});

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-5 left-1/2 z-20 -translate-x-1/2 rounded-full bg-orange-500 px-6 py-3.5 font-semibold text-white shadow-lg shadow-orange-500/30 transition hover:bg-orange-600"
      >
        + 지출 추가
      </button>
    );
  }

  return (
    <div
      className="fixed inset-0 z-30 flex items-end justify-center bg-black/40 sm:items-center"
      onClick={() => setOpen(false)}
    >
      <form
        action={action}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[90dvh] w-full max-w-md space-y-4 overflow-y-auto rounded-t-2xl bg-white p-5 sm:rounded-2xl"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">지출 추가</h2>
          <button type="button" onClick={() => setOpen(false)} className="text-2xl leading-none text-slate-400">
            ×
          </button>
        </div>

        <Field label="이름">
          <input name="name" required autoFocus placeholder="예) 흑돼지 저녁" className="input" />
        </Field>

        <AmountPad value={amount} onChange={setAmount} />

        <Field label="구분">
          <div className="grid grid-cols-2 gap-2">
            {(["fixed", "local"] as const).map((c) => (
              <Choice
                key={c}
                type="radio"
                name="category"
                value={c}
                label={c === "fixed" ? "고정경비" : "현지경비"}
                checked={category === c}
                onChange={() => setCategory(c)}
              />
            ))}
          </div>
        </Field>

        {category === "local" ? (
          <Field label="일차">
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3].map((d) => (
                <Choice
                  key={d}
                  type="radio"
                  name="day"
                  value={String(d)}
                  label={`${d}일차`}
                  defaultChecked={d === (defaultDay || 1)}
                  required
                />
              ))}
            </div>
          </Field>
        ) : (
          <p className="rounded-xl bg-slate-50 px-3 py-2.5 text-sm text-slate-500">
            고정경비는 일차 구분 없이 <b className="text-slate-700">기타</b>로 분류돼요.
          </p>
        )}

        <Field label="부담자">
          <div className="grid grid-cols-3 gap-2">
            {MEMBERS.map((m) => (
              <Choice
                key={m}
                type="radio"
                name="payers"
                value={m}
                label={m}
                checked={payer === m}
                onChange={() => setPayer(m)}
              />
            ))}
          </div>
        </Field>
        <MemberPicker label="이용자" name="users" selected={users} onChange={setUsers} />

        <p className="text-xs text-slate-400">작성자: {me}</p>

        {state.error && <p className="text-sm text-red-600">{state.error}</p>}

        <button
          disabled={pending}
          className="w-full rounded-xl bg-orange-500 py-3 font-semibold text-white transition hover:bg-orange-600 disabled:opacity-60"
        >
          {pending ? "저장 중..." : "저장"}
        </button>
      </form>
    </div>
  );
}

function MemberPicker({
  label,
  name,
  selected,
  onChange,
}: {
  label: string;
  name: string;
  selected: Member[];
  onChange: (v: Member[]) => void;
}) {
  const allSelected = selected.length === MEMBERS.length;
  const toggle = (m: Member) =>
    onChange(selected.includes(m) ? selected.filter((x) => x !== m) : MEMBERS.filter((x) => x === m || selected.includes(x)));

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-sm font-medium text-slate-600">
          {label} <span className="text-slate-400">({selected.length}명)</span>
        </span>
        <button
          type="button"
          onClick={() => onChange(allSelected ? [] : [...MEMBERS])}
          className="text-xs font-medium text-orange-600 hover:underline"
        >
          {allSelected ? "전체 해제" : "전체 선택"}
        </button>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {MEMBERS.map((m) => (
          <Choice
            key={m}
            type="checkbox"
            name={name}
            value={m}
            label={m}
            checked={selected.includes(m)}
            onChange={() => toggle(m)}
          />
        ))}
      </div>
    </div>
  );
}

const STEPS = [100, 1000, 10000];

/** 수기 입력 대신 ±버튼으로 가격 조절 (0원 미만으로는 내려가지 않음) */
function AmountPad({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-sm font-medium text-slate-600">가격</span>
        <button
          type="button"
          onClick={() => onChange(0)}
          className="text-xs font-medium text-slate-400 hover:text-slate-600"
        >
          초기화
        </button>
      </div>
      <input type="hidden" name="amount" value={value} />
      <p
        aria-live="polite"
        className={`rounded-xl border border-slate-300 px-4 py-3 text-right text-2xl font-bold tabular-nums ${
          value === 0 ? "text-slate-300" : "text-slate-900"
        }`}
      >
        {value.toLocaleString("ko-KR")}원
      </p>
      <div className="mt-2 grid grid-cols-3 gap-2">
        {STEPS.map((s) => (
          <button
            key={`+${s}`}
            type="button"
            onClick={() => onChange(value + s)}
            className="rounded-xl bg-orange-50 py-3 text-sm font-semibold text-orange-600 transition hover:bg-orange-100 active:scale-95"
          >
            +{s.toLocaleString("ko-KR")}
          </button>
        ))}
        {STEPS.map((s) => (
          <button
            key={`-${s}`}
            type="button"
            disabled={value < s}
            onClick={() => onChange(Math.max(0, value - s))}
            className="rounded-xl bg-slate-100 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-200 active:scale-95 disabled:opacity-40"
          >
            −{s.toLocaleString("ko-KR")}
          </button>
        ))}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <span className="mb-1.5 block text-sm font-medium text-slate-600">{label}</span>
      {children}
    </div>
  );
}

function Choice({ label, ...input }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="cursor-pointer">
      <input {...input} className="peer sr-only" />
      <span className="block rounded-xl border border-slate-300 py-2.5 text-center text-sm font-medium text-slate-600 transition peer-checked:border-orange-500 peer-checked:bg-orange-50 peer-checked:text-orange-600">
        {label}
      </span>
    </label>
  );
}
