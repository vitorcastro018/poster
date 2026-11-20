"use client";
import { useActionState } from "react";
import { login } from "./actions";

export default function LoginPage() {
  const [error, action, pending] = useActionState(login, null);
  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-4 p-6">
      <h1 className="text-2xl font-semibold text-violet-400">PosterAi</h1>
      <form action={action} className="flex flex-col gap-3">
        <input name="password" type="password" placeholder="Senha" autoFocus required className="input" />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button disabled={pending} className="btn btn-primary">Entrar</button>
      </form>
    </main>
  );
}
