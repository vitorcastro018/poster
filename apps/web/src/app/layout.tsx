import "./globals.css";
import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { Nav } from "@/components/Nav";
import { COOKIE, verifySession } from "@/lib/session";

export const metadata = { title: "PosterAi" };

export default async function RootLayout({ children }: { children: ReactNode }) {
  const logged = await verifySession((await cookies()).get(COOKIE)?.value);
  return (
    <html lang="pt-BR" className="dark">
      <body className="min-h-screen bg-neutral-950 text-neutral-200 antialiased">
        {logged && <Nav />}
        {children}
      </body>
    </html>
  );
}
