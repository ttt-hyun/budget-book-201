"use client";

import { useTransition } from "react";
import { removeExpense } from "./actions";

export default function DeleteButton({ id, name }: { id: number; name: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      disabled={pending}
      onClick={() => {
        if (confirm(`'${name}' 항목을 삭제할까요?`)) start(() => removeExpense(id));
      }}
      className="shrink-0 rounded-lg px-2 py-1 text-xs text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
    >
      {pending ? "..." : "삭제"}
    </button>
  );
}
