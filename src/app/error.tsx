"use client";

/** 예상 못 한 오류가 나도 흰 에러 화면 대신 다시 시도할 수 있게 한다 */
export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="flex min-h-dvh items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200">
        <div className="text-4xl">🍊</div>
        <h1 className="mt-3 text-lg font-bold text-slate-900">문제가 생겼어요</h1>
        <p className="mt-2 text-sm text-slate-500">
          잠시 후 다시 시도해주세요. 계속 같은 화면이 나오면 새로고침해주세요.
        </p>
        <div className="mt-5 flex gap-2">
          <button
            onClick={reset}
            className="flex-1 rounded-xl bg-orange-500 py-3 font-semibold text-white transition hover:bg-orange-600"
          >
            다시 시도
          </button>
          <button
            onClick={() => location.reload()}
            className="flex-1 rounded-xl bg-slate-100 py-3 font-semibold text-slate-600 transition hover:bg-slate-200"
          >
            새로고침
          </button>
        </div>
      </div>
    </main>
  );
}
