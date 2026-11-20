"use client";
import { useActionState } from "react";
import { login } from "./actions";

export default function LoginPage() {
  const [error, action, pending] = useActionState(login, null);
  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-4 p-6">
      <h1 className="text-2xl font-semibold">PosterAi</h1>
      <form action={action} className="flex flex-col gap-3">
        <input name="password" type="password" placeholder="Senha" autoFocus required
          className="rounded-md border border-neutral-300 px-3 py-2" />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button disabled={pending} className="rounded-md bg-neutral-900 px-3 py-2 text-white disabled:opacity-50">
          Entrar
        </button>
      </form>
    </main>
  );
}
