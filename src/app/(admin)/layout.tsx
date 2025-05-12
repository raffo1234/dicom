import type { Metadata } from "next";
import "../globals.css";
import { auth } from "@/lib/auth";
import GlobalModal from "@/components/GlobalModal";
import Aside from "@/components/Aside";
import Link from "next/link";
import { Icon } from "@iconify/react";
import ProfilePopover from "@/components/ProfilePopover";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "Admin Radiologist",
  description: "Admin Radiologist",
  icons: {
    icon: "/favicon.png",
  },
};

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  const user = session?.user;

  return (
    <html lang="es">
      <body>
        <Header />
        <main className="flex items-start max-w-[1360px] mx-auto w-full z-10 relative">
          {user && user?.name && user?.image ? (
            <Aside userName={user.name} userImage={user.image} />
          ) : null}
          <section
            style={{ minHeight: "calc(100vh - 73px)" }}
            className="bg-slate-50 flex-grow relative px-4 md:px-7 lg:px-10 py-12 lg:border-l lg:border-gray-200"
          >
            {children}
          </section>
        </main>
        <GlobalModal />
      </body>
    </html>
  );
}
