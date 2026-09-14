import LoginForm from "./login-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
        <div className="mb-6 text-center">
          <div className="text-4xl">🍊</div>
          <h1 className="mt-2 text-xl font-bold text-slate-900">제주도 여행 가계부</h1>
          <p className="mt-1 text-sm text-slate-500">이름을 선택하고 입장 코드를 입력해주세요</p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
