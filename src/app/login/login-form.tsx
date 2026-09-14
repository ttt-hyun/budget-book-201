"use client";

import { useActionState } from "react";
import { MEMBERS } from "@/lib/members";
import { login } from "./actions";

export default function LoginForm() {
  const [state, action, pending] = useActionState(login, {});

  return (
    <form action={action} className="space-y-4">
      <fieldset>
        <legend className="mb-2 text-sm font-medium text-slate-600">본인 이름</legend>
        <div className="grid grid-cols-3 gap-2">
          {MEMBERS.map((m) => (
            <label key={m} className="cursor-pointer">
              <input type="radio" name="member" value={m} required className="peer sr-only" />
              <span className="block rounded-xl border border-slate-300 py-2.5 text-center text-sm font-medium text-slate-600 transition peer-checked:border-orange-500 peer-checked:bg-orange-50 peer-checked:text-orange-600">
                {m}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <input
        name="code"
        type="password"
        required
        placeholder="입장 코드"
        className="w-full rounded-xl border border-slate-300 px-4 py-3 text-center text-lg tracking-widest outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
      />
      {state.error && <p className="text-center text-sm text-red-600">{state.error}</p>}
      <button
        disabled={pending}
        className="w-full rounded-xl bg-orange-500 py-3 font-semibold text-white transition hover:bg-orange-600 disabled:opacity-60"
      >
        {pending ? "확인 중..." : "입장하기"}
      </button>
    </form>
  );
}
