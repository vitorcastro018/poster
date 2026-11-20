import Link from "next/link";
import { logout } from "@/app/login/actions";

export function Nav() {
  return (
    <header className="border-b border-neutral-800 bg-neutral-950">
      <div className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-3">
        <Link href="/" className="font-semibold text-violet-400">PosterAi</Link>
        <nav className="flex gap-4 text-sm text-neutral-300">
          <Link href="/clientes" className="hover:text-white">Clientes</Link>
          <Link href="/carrosseis" className="hover:text-white">Carrosséis</Link>
        </nav>
        <form action={logout} className="ml-auto">
          <button className="text-sm text-neutral-500 hover:text-neutral-300">Sair</button>
        </form>
      </div>
    </header>
  );
}
