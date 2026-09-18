"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeleteButton({ id, name }: { id: number; name: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function onDelete() {
    if (!confirm(`'${name}' 항목을 삭제할까요?`)) return;
    setPending(true);
    try {
      const res = await fetch(`/api/expenses/${id}`, { method: "DELETE" });
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      if (!res.ok) {
        alert("삭제하지 못했어요. 잠시 후 다시 시도해주세요.");
        return;
      }
      router.refresh();
    } catch {
      alert("네트워크 연결을 확인하고 다시 시도해주세요.");
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      disabled={pending}
      onClick={onDelete}
      className="shrink-0 rounded-lg px-2 py-1 text-xs text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
    >
      {pending ? "..." : "삭제"}
    </button>
  );
}
