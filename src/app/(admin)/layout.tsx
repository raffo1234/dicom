import type { Metadata } from "next";
import "../globals.css";
import { auth } from "@/lib/auth";
import GlobalModal from "@/components/GlobalModal";
import Aside from "@/components/Aside";
import Link from "next/link";
import { Icon } from "@iconify/react";
import ProfilePopover from "@/components/ProfilePopover";

export const metadata: Metadata = {
  title: "Admin Radiologist",
  description: "Admin Radiologist",
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
        <header className="print:hidden border-b border-gray-200 py-3 flex justify-between relative z-20">
          <div className="max-w-[1360px] px-4 mx-auto w-full flex justify-between items-center">
            <h1 className="block">
              <Link href="/" title="Radiologist">
                <span className="p-2 rounded-xl bg-rose-400 block">
                  <Icon
                    icon="solar:airbuds-case-charge-broken"
                    className="text-3xl text-white"
                  />
                </span>
              </Link>
            </h1>
            <ProfilePopover />
          </div>
        </header>
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
